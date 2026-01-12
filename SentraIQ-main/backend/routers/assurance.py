"""
Layer 3: Assurance & Telescope API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional

from backend.database import get_session
from backend.layers.telescope import Telescope, ai_cache
from backend.models.schemas import (
    TelescopeQueryRequest, TelescopeQueryResponse, EvidenceItem,
    AssurancePackRequest, AssurancePackResponse
)


router = APIRouter()


@router.post("/query", response_model=TelescopeQueryResponse)
async def query_evidence(
    request: TelescopeQueryRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Query evidence using natural language (Telescope)

    Example queries:
    - "Show proof of MFA enforcement on SWIFT terminals for Q3"
    - "Find all access control logs from last 90 days"
    - "Get encryption compliance evidence for last month"
    """
    try:
        result = await Telescope.query_evidence(
            session=session,
            query=request.query,
            time_range_start=request.time_range_start,
            time_range_end=request.time_range_end
        )

        # Convert to response model
        evidence_items = [
            EvidenceItem(
                type=item['type'],
                id=item['id'],
                hash=item['hash'],
                filename=item['filename'],
                content_preview=item['content_preview'],
                relevance_score=item['relevance_score'],
                control_id=item.get('control_id'),
                ingested_at=item['ingested_at']
            )
            for item in result['evidence_items']
        ]

        # Use OpenAI (if configured) to generate a natural-language summary of results
        ai_summary = await Telescope.summarize_evidence_with_ai(
            query=result['query'],
            evidence_items=result['evidence_items']
        )

        return TelescopeQueryResponse(
            query=result['query'],
            interpreted_intent=str(result['interpreted_intent']),
            results_count=result['results_count'],
            evidence_items=evidence_items,
            execution_time_ms=result['execution_time_ms'],
            ai_summary=ai_summary
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@router.post("/generate-pack", response_model=AssurancePackResponse)
async def generate_assurance_pack(
    request: AssurancePackRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Generate an Assurance Pack with evidence for a specific time period

    The pack includes:
    - All relevant logs
    - All relevant documents
    - Manifest with metadata
    - SHA-256 hash for integrity
    """
    try:
        query = request.query or f"Evidence for control {request.control_id}"

        pack = await Telescope.generate_assurance_pack(
            session=session,
            control_id=request.control_id,
            query=query,
            time_range_start=request.time_range_start,
            time_range_end=request.time_range_end,
            explicit_log_ids=request.explicit_log_ids,
            explicit_document_ids=request.explicit_document_ids,
        )

        return AssurancePackResponse(
            pack_id=pack.pack_id,
            control_id=pack.control_id,
            evidence_count=pack.evidence_count,
            pack_hash=pack.pack_hash,
            file_path=pack.file_path,
            download_url=f"/api/v1/assurance/download/{pack.pack_id}",
            report_url=f"/api/v1/assurance/report/{pack.pack_id}",
            created_at=pack.created_at
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pack generation failed: {str(e)}")


@router.get("/download/{pack_id}")
async def download_assurance_pack(pack_id: str, session: AsyncSession = Depends(get_session)):
    """Download an assurance pack"""
    from sqlalchemy import select
    from backend.database import AssurancePack
    from pathlib import Path

    stmt = select(AssurancePack).where(AssurancePack.pack_id == pack_id)
    result = await session.execute(stmt)
    pack = result.scalar_one_or_none()

    if not pack:
        raise HTTPException(status_code=404, detail="Assurance pack not found")

    file_path = Path(pack.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Pack file not found")

    return FileResponse(
        path=file_path,
        filename=f"{pack_id}.zip",
        media_type="application/zip"
    )


@router.get("/packs")
async def list_assurance_packs(
    limit: int = 100,
    session: AsyncSession = Depends(get_session)
):
    """
    List all assurance packs with metadata
    """
    from sqlalchemy import select, desc
    from backend.database import AssurancePack
    
    try:
        stmt = select(AssurancePack).order_by(desc(AssurancePack.created_at)).limit(limit)
        result = await session.execute(stmt)
        packs = result.scalars().all()
        
        packs_list = []
        for pack in packs:
            meta = pack.meta_data or {}
            packs_list.append({
                "pack_id": pack.pack_id,
                "control_id": pack.control_id,
                "query": pack.query,
                "evidence_count": pack.evidence_count,
                "pack_hash": pack.pack_hash,
                "created_at": pack.created_at.isoformat() if pack.created_at else None,
                "time_range_start": pack.time_range_start.isoformat() if pack.time_range_start else None,
                "time_range_end": pack.time_range_end.isoformat() if pack.time_range_end else None,
                "download_url": f"/api/v1/assurance/download/{pack.pack_id}",
                "report_url": f"/api/v1/assurance/report/{pack.pack_id}",
                "pack_size_mb": meta.get("pack_size_mb", 0),
                "explicit_evidence": meta.get("explicit_evidence", {}),
            })
        
        return {"packs": packs_list, "total": len(packs_list)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list packs: {str(e)}")


@router.get("/report/{pack_id}")
async def get_pack_report(
    pack_id: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Get markdown report for an assurance pack
    
    The report includes:
    - Pack overview and metadata
    - Query information (if available)
    - Selected evidence items
    - Evidence files included
    - Audit findings
    - Integrity verification
    """
    from fastapi.responses import Response
    
    try:
        report = await Telescope.generate_pack_report(
            session=session,
            pack_id=pack_id
        )
        
        return Response(
            content=report,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'inline; filename="{pack_id}_report.md"'
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@router.get("/cache/stats")
async def get_cache_stats():
    """
    Get AI cache statistics (for debugging/demo purposes)
    """
    return ai_cache.stats()


@router.post("/cache/clear")
async def clear_cache():
    """
    Clear the AI cache (for debugging/demo purposes)
    """
    ai_cache.clear()
    return {"message": "AI cache cleared successfully", "stats": ai_cache.stats()}
