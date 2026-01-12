"""
Layer 2: Evidence Mapping API endpoints (Dojo Mapper) & Natural Language Query (Telescope)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from backend.database import get_session
from backend.layers.dojo_mapper import DojoMapper
from backend.layers.telescope import Telescope
from backend.models.schemas import MappingResult, EvidenceLinkage


router = APIRouter()


class TelescopeQuery(BaseModel):
    natural_language_query: str


@router.post("/map-log/{log_id}")
async def map_log_to_controls(
    log_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Map a log to regulatory controls using Dojo Mapper"""
    try:
        import time
        start_time = time.time()

        evidence_objects = await DojoMapper.map_log_to_controls(session, log_id)

        processing_time_ms = int((time.time() - start_time) * 1000)

        return MappingResult(
            evidence_objects_created=len(evidence_objects),
            linkages=[
                EvidenceLinkage(
                    id=eo.id,
                    control_id=eo.control_id,
                    control_name=eo.control_name,
                    log_id=eo.log_id,
                    document_id=eo.document_id,
                    linkage_score=eo.linkage_score,
                    linkage_reason=eo.linkage_reason,
                    created_at=eo.created_at
                )
                for eo in evidence_objects
            ],
            processing_time_ms=processing_time_ms
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mapping failed: {str(e)}")


@router.post("/map-document/{document_id}")
async def map_document_to_controls(
    document_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Map a document to regulatory controls using Dojo Mapper"""
    try:
        import time
        start_time = time.time()

        evidence_objects = await DojoMapper.map_document_to_controls(session, document_id)

        processing_time_ms = int((time.time() - start_time) * 1000)

        return MappingResult(
            evidence_objects_created=len(evidence_objects),
            linkages=[
                EvidenceLinkage(
                    id=eo.id,
                    control_id=eo.control_id,
                    control_name=eo.control_name,
                    log_id=eo.log_id,
                    document_id=eo.document_id,
                    linkage_score=eo.linkage_score,
                    linkage_reason=eo.linkage_reason,
                    created_at=eo.created_at
                )
                for eo in evidence_objects
            ],
            processing_time_ms=processing_time_ms
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mapping failed: {str(e)}")


@router.get("/by-control/{control_id}")
async def get_evidence_by_control(
    control_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get all evidence objects for a specific control"""
    evidence_objects = await DojoMapper.get_evidence_by_control(session, control_id)

    return {
        "control_id": control_id,
        "count": len(evidence_objects),
        "evidence_objects": [
            {
                "id": eo.id,
                "control_id": eo.control_id,
                "control_name": eo.control_name,
                "log_id": eo.log_id,
                "document_id": eo.document_id,
                "log_hash": eo.log_hash,
                "document_hash": eo.document_hash,
                "linkage_score": eo.linkage_score,
                "linkage_reason": eo.linkage_reason,
                "created_at": eo.created_at
            }
            for eo in evidence_objects
        ]
    }


@router.post("/telescope")
async def natural_language_query(
    query: TelescopeQuery,
    session: AsyncSession = Depends(get_session)
):
    """
    Query evidence using natural language powered by AI.
    Searches across all logs and documents to find relevant evidence.
    Returns evidence items with AI-generated summaries.
    """
    try:
        import time
        start_time = time.time()

        # Use Telescope for NL query processing
        results = await Telescope.query_evidence(session, query.natural_language_query)

        # Generate AI summary of the results
        ai_summary = await Telescope.summarize_evidence_with_ai(
            query=query.natural_language_query,
            evidence_items=results['evidence_items']
        )

        processing_time_ms = int((time.time() - start_time) * 1000)

        return {
            "query": query.natural_language_query,
            "interpreted_intent": results.get('interpreted_intent', {}),
            "count": results['results_count'],
            "processing_time_ms": results['execution_time_ms'],
            "ai_summary": ai_summary,
            "time_range": results.get('time_range', {}),
            "evidence_objects": [
                {
                    "evidence_id": str(item['id']),
                    "source_type": "RAW_LOG" if item['type'] == 'log' else "RAW_DOCUMENT",
                    "source_file": item['filename'],
                    "extracted_text": item.get('content_preview', ''),
                    "timestamp": item['ingested_at'].isoformat() if isinstance(item['ingested_at'], datetime) else str(item['ingested_at']),
                    "compliance_mappings": [
                        {"control_id": item['control_id']}
                    ] if item.get('control_id') else [],
                    "relevance_score": item.get('relevance_score', 0.5)
                }
                for item in results['evidence_items']
            ]
        }
    except Exception as e:
        import traceback
        print(f"Telescope query error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
