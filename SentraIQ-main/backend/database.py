"""
Database models and connection setup for SentralQ
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, JSON, Integer
from datetime import datetime
from typing import Optional, Dict, Any
import json

from backend.config import settings


# Database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True if settings.ENVIRONMENT == "development" else False,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Base class for models
class Base(DeclarativeBase):
    pass


# Models for the 3-layer architecture

class RawLog(Base):
    """Layer 1: Raw Vault - Machine-generated logs"""
    __tablename__ = "raw_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # SHA-256
    source: Mapped[str] = mapped_column(String(50))  # SWIFT, FPS, CHAPS, Firewall, etc.
    filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text)  # Raw log content
    size_bytes: Mapped[int] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)


class RawDocument(Base):
    """Layer 1: Raw Vault - Documentary evidence (PDFs)"""
    __tablename__ = "raw_documents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # SHA-256
    doc_type: Mapped[str] = mapped_column(String(100))  # Policy, Audit Report, Config, etc.
    filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    size_bytes: Mapped[int] = mapped_column(Integer)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)


class EvidenceObject(Base):
    """Layer 2: Dojo Mapper - Unified evidence objects linking logs to documents"""
    __tablename__ = "evidence_objects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    control_id: Mapped[str] = mapped_column(String(50), index=True)  # e.g., AC-001
    control_name: Mapped[str] = mapped_column(String(200))
    log_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    document_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    log_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    document_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    linkage_score: Mapped[float] = mapped_column()  # Confidence score 0-1
    linkage_reason: Mapped[str] = mapped_column(Text)  # Why this log links to this doc
    time_range_start: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    time_range_end: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)


class AssurancePack(Base):
    """Layer 3: Telescope - Generated assurance packs"""
    __tablename__ = "assurance_packs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pack_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    control_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    query: Mapped[str] = mapped_column(Text)  # Original query/requirement
    time_range_start: Mapped[datetime] = mapped_column(DateTime)
    time_range_end: Mapped[datetime] = mapped_column(DateTime)
    evidence_count: Mapped[int] = mapped_column(Integer)
    pack_hash: Mapped[str] = mapped_column(String(64))  # Hash of the pack for integrity
    file_path: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)


class TelescopeQuery(Base):
    """Layer 3: Telescope - Query history"""
    __tablename__ = "telescope_queries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    query: Mapped[str] = mapped_column(Text)
    interpreted_intent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    results_count: Mapped[int] = mapped_column(Integer)
    execution_time_ms: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meta_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)


# Database initialization
async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Main execution for database setup
if __name__ == "__main__":
    import asyncio

    async def main():
        print("Initializing SentralQ database...")
        await init_db()
        print("Database initialized successfully!")

    asyncio.run(main())
