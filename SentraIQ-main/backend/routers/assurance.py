"""
Layer 3: Assurance & Telescope API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional

from backend.database import get_session
from backend.layers.telescope import Telescope, ai_cache
from backend.layers.control_library import (
    get_all_controls, get_controls_by_infrastructure, get_controls_by_framework,
    get_shared_controls, get_mandatory_vs_advisory, Framework, InfrastructureType,
    get_swift_architecture_types, get_controls_by_swift_architecture, SwiftArchitectureType
)
from backend.models.schemas import (
    TelescopeQueryRequest, TelescopeQueryResponse, EvidenceItem,
    AssurancePackRequest, AssurancePackResponse,
    SwiftExcelReportRequest
)
from backend.excel_report import generate_cscf_excel


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

        # Convert to response model with error handling
        evidence_items = []
        for item in result.get('evidence_items', []):
            try:
                # Ensure ingested_at is a datetime object
                ingested_at = item.get('ingested_at')
                if isinstance(ingested_at, str):
                    from dateutil.parser import parse
                    ingested_at = parse(ingested_at)
                elif ingested_at is None:
                    ingested_at = datetime.utcnow()
                
                evidence_items.append(
                    EvidenceItem(
                        type=item.get('type', 'log'),
                        id=item.get('id', 0),
                        hash=item.get('hash', ''),
                        filename=item.get('filename', ''),
                        content_preview=item.get('content_preview', ''),
                        relevance_score=item.get('relevance_score', 0.0),
                        control_id=item.get('control_id'),
                        ingested_at=ingested_at
                    )
                )
            except Exception as item_error:
                print(f"Warning: Failed to process evidence item: {str(item_error)}")
                continue

        # Use OpenAI (if configured) to generate a natural-language summary of results
        ai_summary = await Telescope.summarize_evidence_with_ai(
            query=result['query'],
            evidence_items=result['evidence_items']
        )
        
        # Perform gap analysis (only if time range is available)
        gap_analysis = None
        try:
            time_range_start = request.time_range_start
            time_range_end = request.time_range_end
            
            # If not provided, try to get from result
            if not time_range_start or not time_range_end:
                time_range = result.get('time_range', {})
                if time_range:
                    from dateutil.parser import parse
                    time_range_start = time_range.get('start')
                    time_range_end = time_range.get('end')
                    if time_range_start:
                        time_range_start = parse(time_range_start) if isinstance(time_range_start, str) else time_range_start
                    if time_range_end:
                        time_range_end = parse(time_range_end) if isinstance(time_range_end, str) else time_range_end
            
            if time_range_start and time_range_end:
                # Extract control_id from intent if available
                control_id = None
                intent = result.get('interpreted_intent', {})
                if isinstance(intent, str):
                    import json
                    try:
                        intent = json.loads(intent)
                    except:
                        intent = {}
                control_id = intent.get('control_id') or (request.control_id if hasattr(request, 'control_id') else None)
                
                gap_analysis = await Telescope.perform_gap_analysis(
                    control_id=control_id,
                    evidence_items=result['evidence_items'],
                    time_range_start=time_range_start,
                    time_range_end=time_range_end
                )
        except Exception as gap_error:
            # Don't fail the entire query if gap analysis fails
            print(f"Warning: Gap analysis failed: {str(gap_error)}")
            gap_analysis = None

        response = TelescopeQueryResponse(
            query=result['query'],
            interpreted_intent=str(result['interpreted_intent']),
            results_count=result['results_count'],
            evidence_items=evidence_items,
            execution_time_ms=result['execution_time_ms'],
            ai_summary=ai_summary
        )
        
        # Add gap analysis to response metadata if available
        if gap_analysis:
            response.gap_analysis = gap_analysis
        
        return response

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
            assessment_answers=request.assessment_answers,
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
    format: Optional[str] = "markdown",
    session: AsyncSession = Depends(get_session)
):
    """
    Get report for an assurance pack (markdown or PDF)
    
    The report includes:
    - Pack overview and metadata
    - Assessment questions and answers
    - Selected evidence items
    - Evidence files included
    - Gap analysis
    - Integrity verification
    
    Args:
        pack_id: Pack ID
        format: Report format - "markdown" (default) or "pdf"
    """
    from fastapi.responses import Response, FileResponse
    
    try:
        if format.lower() == "pdf":
            # Generate PDF report
            pdf_path = await Telescope.generate_pack_pdf_report(
                session=session,
                pack_id=pack_id
            )
            
            if not pdf_path.exists():
                raise HTTPException(status_code=500, detail="PDF file was not created")
            
            return FileResponse(
                path=pdf_path,
                filename=f"{pack_id}_report.pdf",
                media_type="application/pdf"
            )
        else:
            # Generate markdown report (default)
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


@router.get("/controls")
async def get_controls(
    infrastructure: Optional[str] = None,
    frameworks: Optional[str] = None
):
    """
    Get controls based on infrastructure and framework selection
    Returns mandatory vs advisory controls and shared controls
    """
    try:
        framework_list = []
        if frameworks:
            framework_list = [Framework(f) for f in frameworks.split(',') if f in [e.value for e in Framework]]
        
        infra_type = None
        if infrastructure:
            try:
                infra_type = InfrastructureType(infrastructure)
            except ValueError:
                pass
        
        controls_data = {
            "all_controls": [],
            "mandatory": [],
            "advisory": [],
            "shared_controls": []
        }
        
        if infra_type and framework_list:
            # Get controls for infrastructure
            controls = get_controls_by_infrastructure(infra_type)
            
            # Filter by frameworks
            framework_control_ids = set()
            for fw in framework_list:
                fw_controls = get_controls_by_framework(fw)
                framework_control_ids.update(fw_controls.keys())
            
            filtered_controls = [c for c in controls if c["control_id"] in framework_control_ids]
            
            # Get mandatory vs advisory
            mandatory_advisory = get_mandatory_vs_advisory(infra_type, framework_list)
            
            # Get shared controls
            shared = get_shared_controls(framework_list)
            
            controls_data = {
                "all_controls": filtered_controls,
                "mandatory": mandatory_advisory["mandatory"],
                "advisory": mandatory_advisory["advisory"],
                "shared_controls": shared
            }
        elif framework_list:
            # Just frameworks, no infrastructure
            all_controls = get_all_controls()
            framework_control_ids = set()
            for fw in framework_list:
                fw_controls = get_controls_by_framework(fw)
                framework_control_ids.update(fw_controls.keys())
            
            filtered_controls = [all_controls[cid] for cid in framework_control_ids if cid in all_controls]
            shared = get_shared_controls(framework_list)
            
            controls_data = {
                "all_controls": filtered_controls,
                "mandatory": [c for c in filtered_controls if c.get("type") == "mandatory"],
                "advisory": [c for c in filtered_controls if c.get("type") == "advisory"],
                "shared_controls": shared
            }
        
        return controls_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get controls: {str(e)}")


@router.get("/regulatory-updates/check")
async def check_regulatory_updates(
    framework: Optional[str] = None
):
    """
    Stub endpoint for regulatory update checks (Gemini + Google Search Grounding)
    Returns mocked regulatory update information for demo purposes
    
    Args:
        framework: Framework to check (SWIFT_CSP, SOC2, etc.)
    
    Returns:
        Mocked regulatory update information
    """
    from datetime import datetime, timedelta
    
    # Mock regulatory updates
    updates = []
    
    if not framework or framework.upper() == "SWIFT_CSP":
        updates.append({
            "framework": "SWIFT_CSP",
            "update_type": "version_change",
            "from_version": "CSCF v2023",
            "to_version": "CSCF v2024",
            "description": "SWIFT Customer Security Control Framework updated from v2023 to v2024",
            "changes": [
                "New mandatory control SWIFT-2.9: Enhanced monitoring requirements",
                "Updated SWIFT-2.7: Vulnerability scanning frequency changed from quarterly to monthly",
                "Advisory control SWIFT-3.2: Cloud security best practices added"
            ],
            "detected_at": (datetime.utcnow() - timedelta(days=7)).isoformat(),
            "source": "SWIFT official bulletin",
            "action_required": True,
            "severity": "high"
        })
    
    if not framework or framework.upper() == "SOC2":
        updates.append({
            "framework": "SOC2",
            "update_type": "control_addition",
            "from_version": "SOC 2 Type II 2023",
            "to_version": "SOC 2 Type II 2024",
            "description": "New control CC8.2 added for cloud infrastructure monitoring",
            "changes": [
                "New control CC8.2: Cloud infrastructure monitoring and alerting",
                "Updated CC7.1: Enhanced system monitoring requirements"
            ],
            "detected_at": (datetime.utcnow() - timedelta(days=14)).isoformat(),
            "source": "AICPA official update",
            "action_required": True,
            "severity": "medium"
        })
    
    return {
        "checked_at": datetime.utcnow().isoformat(),
        "updates": updates,
        "total_updates": len(updates),
        "note": "This is a mocked response for demo purposes. In production, this would use Gemini API with Google Search Grounding to monitor official regulatory bulletins."
    }


@router.get("/swift/architecture-types")
async def get_swift_architecture_types_endpoint():
    """
    Get all SWIFT CSP architecture types (A1, A2, A3, A4, B)
    """
    try:
        architecture_types = get_swift_architecture_types()
        return {
            "architecture_types": architecture_types,
            "count": len(architecture_types)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get SWIFT architecture types: {str(e)}")


@router.get("/swift/controls-by-architecture")
async def get_swift_controls_by_architecture(
    architecture_type: str
):
    """
    Get controls applicable to a specific SWIFT architecture type
    
    Args:
        architecture_type: SWIFT architecture type (A1, A2, A3, A4, B)
    """
    try:
        try:
            arch_enum = SwiftArchitectureType(architecture_type.upper())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid architecture type: {architecture_type}. Must be one of: A1, A2, A3, A4, B"
            )
        
        controls = get_controls_by_swift_architecture(arch_enum)
        return {
            "architecture_type": architecture_type.upper(),
            "controls": controls,
            "count": len(controls)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get controls: {str(e)}")


@router.get("/swift/control-applicability-matrix")
async def get_swift_control_applicability_matrix():
    """
    Get the full control applicability matrix for SWIFT CSP
    Returns domains, controls, and their applicability across all architecture types
    """
    try:
        from backend.layers.control_library import SWIFT_CSP_MAPPING
        
        if not SWIFT_CSP_MAPPING:
            return {
                "framework": "SWIFT CSP v2024",
                "version": "1.4",
                "control_applicability_matrix": [],
                "swift_architecture_types": []
            }
        
        return {
            "framework": SWIFT_CSP_MAPPING.get("framework", "SWIFT CSP v2024"),
            "version": SWIFT_CSP_MAPPING.get("version", "1.4"),
            "control_applicability_matrix": SWIFT_CSP_MAPPING.get("control_applicability_matrix", []),
            "swift_architecture_types": SWIFT_CSP_MAPPING.get("swift_architecture_types", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get control applicability matrix: {str(e)}")


@router.post("/swift/excel-report")
async def generate_swift_excel_report(
    request: SwiftExcelReportRequest,
):
    """
    Generate a SWIFT CSCF Excel assessment report based on control status.

    The request should contain a list of control_statuses with:
    - control_id (matching a worksheet name in the template, or configured mapping)
    - status: "in-place" | "not-in-place" | "not-applicable"
    - optional answer_summary for human-readable context

    The endpoint returns an .xlsx file as a binary response.
    """
    from datetime import datetime

    try:
        excel_bytes = generate_cscf_excel(request)

        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        filename = f"SWIFT_CSCF_Assessment_{request.swift_architecture_type or 'N_A'}_{timestamp}.xlsx"

        return Response(
            content=excel_bytes.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            },
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate SWIFT Excel report: {str(e)}")
