"""
Layer 1: Ingestion API endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from backend.database import get_session
from backend.layers.raw_vault import RawVault
from backend.models.schemas import LogIngestResponse, DocumentIngestResponse
from backend.layers.dojo_mapper import DojoMapper


router = APIRouter()


@router.post("/log", response_model=LogIngestResponse)
async def ingest_log(
    file: UploadFile = File(...),
    source: str = Form(...),
    description: Optional[str] = Form(None),
    auto_map: bool = Form(True),
    session: AsyncSession = Depends(get_session)
):
    """
    Ingest a log file into the Raw Vault

    - **file**: Log file to upload
    - **source**: Source system (SWIFT, FPS, CHAPS, Firewall, etc.)
    - **description**: Optional description
    - **auto_map**: Automatically map to controls using Dojo Mapper
    """
    try:
        # Read file content
        content = await file.read()

        # Ingest to Raw Vault
        raw_log = await RawVault.ingest_log(
            session=session,
            file_content=content,
            filename=file.filename,
            source=source,
            description=description
        )

        # Automatically map to controls if requested
        if auto_map:
            try:
                await DojoMapper.map_log_to_controls(session, raw_log.id)
            except Exception as e:
                print(f"Warning: Auto-mapping failed: {e}")

        return LogIngestResponse(
            id=raw_log.id,
            hash=raw_log.hash,
            source=raw_log.source,
            filename=raw_log.filename,
            size_bytes=raw_log.size_bytes,
            ingested_at=raw_log.ingested_at,
            message=f"Log ingested successfully with hash {raw_log.hash}"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest log: {str(e)}")


@router.post("/document", response_model=DocumentIngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    description: Optional[str] = Form(None),
    auto_map: bool = Form(True),
    session: AsyncSession = Depends(get_session)
):
    """
    Ingest a document (PDF) into the Raw Vault

    - **file**: PDF file to upload
    - **doc_type**: Document type (Policy, Audit Report, Configuration, etc.)
    - **description**: Optional description
    - **auto_map**: Automatically map to controls using Dojo Mapper
    """
    try:
        # Read file content
        content = await file.read()

        # Ingest to Raw Vault
        raw_doc = await RawVault.ingest_document(
            session=session,
            file_content=content,
            filename=file.filename,
            doc_type=doc_type,
            description=description
        )

        # Automatically map to controls if requested
        if auto_map:
            try:
                await DojoMapper.map_document_to_controls(session, raw_doc.id)
            except Exception as e:
                print(f"Warning: Auto-mapping failed: {e}")

        page_count = raw_doc.meta_data.get('page_count') if raw_doc.meta_data else None

        return DocumentIngestResponse(
            id=raw_doc.id,
            hash=raw_doc.hash,
            doc_type=raw_doc.doc_type,
            filename=raw_doc.filename,
            size_bytes=raw_doc.size_bytes,
            page_count=page_count,
            ingested_at=raw_doc.ingested_at,
            message=f"Document ingested successfully with hash {raw_doc.hash}"
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")


@router.get("/logs")
async def list_logs(
    limit: int = 100,
    session: AsyncSession = Depends(get_session)
):
    """Get all ingested logs"""
    logs = await RawVault.get_all_logs(session, limit=limit)
    return {
        "count": len(logs),
        "logs": [
            {
                "id": log.id,
                "hash": log.hash,
                "source": log.source,
                "filename": log.filename,
                "size_bytes": log.size_bytes,
                "ingested_at": log.ingested_at,
                "description": log.description
            }
            for log in logs
        ]
    }


@router.get("/documents")
async def list_documents(
    limit: int = 100,
    session: AsyncSession = Depends(get_session)
):
    """Get all ingested documents"""
    docs = await RawVault.get_all_documents(session, limit=limit)
    return {
        "count": len(docs),
        "documents": [
            {
                "id": doc.id,
                "hash": doc.hash,
                "doc_type": doc.doc_type,
                "filename": doc.filename,
                "size_bytes": doc.size_bytes,
                "ingested_at": doc.ingested_at,
                "description": doc.description
            }
            for doc in docs
        ]
    }


@router.delete("/log/{log_id}")
async def delete_log(
    log_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Delete an ingested log and its associated evidence objects"""
    try:
        await RawVault.delete_log(session, log_id)
        return {"message": f"Log {log_id} deleted successfully", "deleted": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete log: {str(e)}")


@router.delete("/document/{document_id}")
async def delete_document(
    document_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Delete an ingested document and its associated evidence objects"""
    try:
        await RawVault.delete_document(session, document_id)
        return {"message": f"Document {document_id} deleted successfully", "deleted": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
