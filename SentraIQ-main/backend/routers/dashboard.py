"""
Dashboard API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from backend.database import get_session, RawLog, RawDocument, EvidenceObject, AssurancePack
from backend.models.schemas import DashboardStats


router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(session: AsyncSession = Depends(get_session)):
    """Get dashboard statistics"""

    # Total logs
    logs_stmt = select(func.count(RawLog.id))
    logs_result = await session.execute(logs_stmt)
    total_logs = logs_result.scalar()

    # Total documents
    docs_stmt = select(func.count(RawDocument.id))
    docs_result = await session.execute(docs_stmt)
    total_documents = docs_result.scalar()

    # Total evidence objects
    evidence_stmt = select(func.count(EvidenceObject.id))
    evidence_result = await session.execute(evidence_stmt)
    total_evidence_objects = evidence_result.scalar()

    # Total assurance packs
    packs_stmt = select(func.count(AssurancePack.id))
    packs_result = await session.execute(packs_stmt)
    total_assurance_packs = packs_result.scalar()

    # Recent ingestions (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_logs_stmt = select(func.count(RawLog.id)).where(RawLog.ingested_at >= yesterday)
    recent_logs_result = await session.execute(recent_logs_stmt)
    recent_logs = recent_logs_result.scalar()

    recent_docs_stmt = select(func.count(RawDocument.id)).where(RawDocument.ingested_at >= yesterday)
    recent_docs_result = await session.execute(recent_docs_stmt)
    recent_docs = recent_docs_result.scalar()

    return DashboardStats(
        total_logs=total_logs,
        total_documents=total_documents,
        total_evidence_objects=total_evidence_objects,
        total_assurance_packs=total_assurance_packs,
        recent_ingestions=recent_logs + recent_docs
    )
