"""
Layer 3: Assurance & Telescope API endpoints
"""
import json
import os
import shutil
import zipfile

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime
from typing import Optional, List

from backend.database import get_session, AssurancePack, AssessmentSession
from backend.layers.telescope import Telescope, ai_cache
from backend.layers.control_library import (
    get_all_controls, get_controls_by_infrastructure, get_controls_by_framework,
    get_shared_controls, get_mandatory_vs_advisory, Framework, InfrastructureType,
    get_swift_architecture_types, get_controls_by_swift_architecture, SwiftArchitectureType
)
from backend.models.schemas import (
    TelescopeQueryRequest,
    TelescopeQueryResponse,
    EvidenceItem,
    AssurancePackRequest,
    AssurancePackResponse,
    SwiftExcelReportRequest,
    AssessmentSessionCreate,
    AssessmentSessionUpdate,
    AssessmentSessionResponse,
)
from backend.excel_report import generate_cscf_excel
from backend.config import settings


router = APIRouter()


@router.post("/sessions", response_model=AssessmentSessionResponse)
async def create_assessment_session(
    request: AssessmentSessionCreate,
    session: AsyncSession = Depends(get_session),
):
    """
    Create a new assessment session.

    This is typically called when the user completes Step 1
    (Select Compliance Framework) and clicks Continue to Pack Generation.
    """
    try:
        db_session = AssessmentSession(
            status="in-progress",
            current_step=1,
            objective_selection=request.objective_selection,
            swift_architecture_type=request.swift_architecture_type,
        )
        session.add(db_session)
        await session.commit()
        await session.refresh(db_session)
        return AssessmentSessionResponse.from_orm(db_session)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create assessment session: {str(e)}")


@router.patch("/sessions/{session_id}", response_model=AssessmentSessionResponse)
async def update_assessment_session(
    session_id: int,
    request: AssessmentSessionUpdate,
    session: AsyncSession = Depends(get_session),
):
    """
    Partially update an assessment session as the user progresses through steps.

    Any provided fields will be patched onto the session record.
    """
    try:
        result = await session.execute(
            select(AssessmentSession).where(AssessmentSession.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        if not db_session:
            raise HTTPException(status_code=404, detail="Assessment session not found")

        updatable_fields = [
            "status",
            "current_step",
            "objective_selection",
            "swift_architecture_type",
            "requirements_status",
            "assessment_answers",
            "control_statuses",
            "evidence_summary",
            "pack_id",
            "swift_excel_filename",
            "swift_excel_path",
            "meta_data",
        ]

        data = request.model_dump(exclude_unset=True)
        for field in updatable_fields:
            if field in data:
                setattr(db_session, field, data[field])

        # If status transitioned to completed and no completed_at set, stamp it
        if data.get("status") == "completed" and db_session.completed_at is None:
            db_session.completed_at = datetime.utcnow()

        await session.commit()
        await session.refresh(db_session)
        return AssessmentSessionResponse.from_orm(db_session)
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update assessment session: {str(e)}")


@router.get("/sessions/{session_id}", response_model=AssessmentSessionResponse)
async def get_assessment_session(
    session_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Fetch a single assessment session by ID."""
    try:
        result = await session.execute(
            select(AssessmentSession).where(AssessmentSession.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        if not db_session:
            raise HTTPException(status_code=404, detail="Assessment session not found")
        return AssessmentSessionResponse.from_orm(db_session)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch assessment session: {str(e)}")


@router.get("/sessions", response_model=List[AssessmentSessionResponse])
async def list_assessment_sessions(
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
):
    """
    List recent assessment sessions for history views.

    Returns high-level metadata for each session, including any associated
    assurance pack or SWIFT Excel file.
    """
    try:
        stmt = (
            select(AssessmentSession)
            .order_by(desc(AssessmentSession.started_at))
            .limit(limit)
        )
        result = await session.execute(stmt)
        sessions = result.scalars().all()
        return [AssessmentSessionResponse.from_orm(s) for s in sessions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list assessment sessions: {str(e)}")


@router.delete("/sessions/{session_id}")
async def delete_assessment_session(
    session_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Delete an assessment session.

    This only deletes the session tracking record; it does not delete any
    underlying assurance packs or evidence from storage.
    """
    try:
        result = await session.execute(
            select(AssessmentSession).where(AssessmentSession.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        if not db_session:
            raise HTTPException(status_code=404, detail="Assessment session not found")

        await session.delete(db_session)
        await session.commit()
        return {"message": "Assessment session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete assessment session: {str(e)}")


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

        # If this pack is associated with an assessment session, attempt to
        # retrieve any SWIFT Excel report previously generated for that session
        # so it can be bundled into the assurance pack ZIP.
        swift_excel_filename: Optional[str] = None
        swift_excel_path: Optional[str] = None
        if request.session_id is not None:
            try:
                result = await session.execute(
                    select(AssessmentSession).where(AssessmentSession.id == request.session_id)
                )
                session_row = result.scalar_one_or_none()
                if session_row:
                    swift_excel_filename = session_row.swift_excel_filename
                    swift_excel_path = session_row.swift_excel_path
            except Exception:
                # Do not fail pack generation if session lookup fails
                await session.rollback()

        pack = await Telescope.generate_assurance_pack(
            session=session,
            control_id=request.control_id,
            query=query,
            time_range_start=request.time_range_start,
            time_range_end=request.time_range_end,
            explicit_log_ids=request.explicit_log_ids,
            explicit_document_ids=request.explicit_document_ids,
            assessment_answers=request.assessment_answers,
            swift_excel_filename=swift_excel_filename,
            swift_excel_path=swift_excel_path,
        )

        # If this pack is part of an assessment session, link it
        if request.session_id is not None:
            try:
                result = await session.execute(
                    select(AssessmentSession).where(AssessmentSession.id == request.session_id)
                )
                db_session = result.scalar_one_or_none()
                if db_session:
                    db_session.pack_id = pack.pack_id
                    # Mark session as completed if not already
                    db_session.status = db_session.status or "completed"
                    if db_session.current_step is None or db_session.current_step < 8:
                        db_session.current_step = 8
                    if db_session.completed_at is None:
                        db_session.completed_at = datetime.utcnow()
                    await session.commit()
            except Exception:
                # Don't fail pack generation if session linkage fails
                await session.rollback()

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
    session: AsyncSession = Depends(get_session),
):
    """
    Get report for an assurance pack (markdown only)
    
    The report includes:
    - Pack overview and metadata
    - Assessment questions and answers
    - Selected evidence items
    - Evidence files included
    - Gap analysis
    - Integrity verification
    
    Args:
        pack_id: Pack ID
    """
    from fastapi.responses import Response
    
    try:
        # Always generate markdown report
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
    session: AsyncSession = Depends(get_session),
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
    from pathlib import Path

    try:
        excel_bytes = generate_cscf_excel(request)

        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")

        # If we have a session_id, persist the Excel file on disk and
        # update the associated AssessmentSession with the path.
        filename = f"SWIFT_CSCF_Assessment_{request.swift_architecture_type or 'N_A'}_{timestamp}.xlsx"
        excel_content = excel_bytes.getvalue()

        if request.session_id is not None:
            try:
                # Make filename session-aware for easier tracking
                session_filename = (
                    f"SWIFT_CSCF_Assessment_session-{request.session_id}_"
                    f"{request.swift_architecture_type or 'N_A'}_{timestamp}.xlsx"
                )
                file_path = settings.SWIFT_EXCEL_PATH / session_filename
                Path(file_path).write_bytes(excel_content)

                result = await session.execute(
                    select(AssessmentSession).where(AssessmentSession.id == request.session_id)
                )
                db_session = result.scalar_one_or_none()
                if db_session:
                    db_session.swift_excel_filename = session_filename
                    db_session.swift_excel_path = str(file_path)
                    if db_session.current_step is None or db_session.current_step < 8:
                        db_session.current_step = 8
                    await session.commit()

                    # If this session already has an assurance pack, update that pack
                    # to include the newly generated SWIFT Excel file. This makes the
                    # Excel appear inside the existing pack ZIP without requiring the
                    # user to regenerate the pack.
                    if db_session.pack_id:
                        try:
                            pack_id = db_session.pack_id
                            pack_dir = settings.ASSURANCE_PACKS_PATH / pack_id
                            zip_path = settings.ASSURANCE_PACKS_PATH / f"{pack_id}.zip"
                            manifest_path = pack_dir / "manifest.json"

                            if pack_dir.exists() and manifest_path.exists():
                                # Load existing manifest
                                with open(manifest_path, "r") as f:
                                    manifest = json.load(f)

                                # Ensure destination directory exists
                                reports_dir = pack_dir / "reports"
                                reports_dir.mkdir(exist_ok=True)

                                excel_src = Path(file_path)
                                if excel_src.exists():
                                    excel_dest = reports_dir / session_filename
                                    shutil.copy2(excel_src, excel_dest)

                                    excel_size = excel_dest.stat().st_size
                                    relative_excel_path = excel_dest.relative_to(pack_dir)

                                    # Ensure manifest fields exist
                                    manifest.setdefault("files", [])
                                    manifest.setdefault("files_copied", 0)
                                    manifest.setdefault("total_file_size_bytes", 0)

                                    manifest["files"].append(
                                        {
                                            "type": "swift_excel",
                                            "id": None,
                                            "filename": excel_dest.name,
                                            "relative_path": str(relative_excel_path),
                                            "size_bytes": excel_size,
                                        }
                                    )
                                    manifest["files_copied"] += 1
                                    manifest["total_file_size_bytes"] += excel_size

                                    # Update swift_excel metadata
                                    manifest.setdefault("swift_excel", {})
                                    manifest["swift_excel"]["filename"] = excel_dest.name
                                    manifest["swift_excel"]["relative_path"] = str(
                                        relative_excel_path
                                    )

                                    # Persist updated manifest
                                    with open(manifest_path, "w") as f:
                                        json.dump(manifest, f, indent=2)

                                    # Recreate ZIP to include the Excel
                                    if zip_path.exists():
                                        zip_path.unlink()
                                    with zipfile.ZipFile(
                                        zip_path, "w", zipfile.ZIP_DEFLATED
                                    ) as zipf:
                                        for root, dirs, files in os.walk(pack_dir):
                                            root_path = Path(root)
                                            for file in files:
                                                file_path_in_dir = root_path / file
                                                arcname = file_path_in_dir.relative_to(pack_dir)
                                                zipf.write(file_path_in_dir, arcname)

                        except Exception:
                            # Do not fail Excel download or session update if pack update fails
                            pass
            except Exception:
                await session.rollback()
                # Do not fail Excel download if session linkage/storage fails

        return Response(
            content=excel_content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            },
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate SWIFT Excel report: {str(e)}")


@router.get("/sessions/{session_id}/swift-excel")
async def download_swift_excel_for_session(
    session_id: int,
    session: AsyncSession = Depends(get_session),
):
    """
    Download the SWIFT CSCF Excel assessment file associated with a session.

    This serves the previously generated Excel file that was stored on disk
    when the user ran the SWIFT Excel report step in the generate flow.
    """
    from pathlib import Path

    try:
        result = await session.execute(
            select(AssessmentSession).where(AssessmentSession.id == session_id)
        )
        db_session = result.scalar_one_or_none()
        if not db_session:
            raise HTTPException(status_code=404, detail="Assessment session not found")

        if not db_session.swift_excel_path or not db_session.swift_excel_filename:
            raise HTTPException(
                status_code=404,
                detail="No SWIFT Excel report is associated with this session",
            )

        excel_path = Path(db_session.swift_excel_path)
        if not excel_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Stored SWIFT Excel file could not be found on disk",
            )

        return FileResponse(
            path=excel_path,
            filename=db_session.swift_excel_filename,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download SWIFT Excel report for session: {str(e)}",
        )
