"""
Layer 1: The Raw Vault - Ingestion Layer
Secure, immutable entry point for logs and documents with SHA-256 hashing
"""
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import shutil

from backend.database import RawLog, RawDocument
from backend.utils.hashing import calculate_file_hash, calculate_content_hash, calculate_hash_with_metadata
from backend.utils.pdf_parser import extract_text_from_pdf, extract_pdf_metadata
from backend.config import settings
from backend.layers.auto_tagger import AutoTagger
import uuid


class RawVault:
    """
    Layer 1: Raw Vault for immutable storage of logs and documents
    """

    @staticmethod
    async def ingest_log(
        session: AsyncSession,
        file_content: bytes,
        filename: str,
        source: str,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        source_timestamp: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> RawLog:
        """
        Ingest a log file into the Raw Vault with immutable lineage and auto-tagging

        Args:
            session: Database session
            file_content: Raw file content
            filename: Original filename
            source: Source system (SWIFT, FPS, CHAPS, Firewall, etc.)
            description: Optional description
            metadata: Optional additional metadata
            source_timestamp: Optional ISO timestamp from source system
            agent_id: Optional ingestion agent ID

        Returns:
            RawLog database record
        """
        # Calculate hash for immutability
        content_str = file_content.decode('utf-8', errors='ignore')
        file_hash = calculate_content_hash(content_str)
        
        # Generate agent ID if not provided
        if not agent_id:
            agent_id = f"ingest-agent-{uuid.uuid4().hex[:8]}"
        
        # Use current timestamp if source timestamp not provided
        if not source_timestamp:
            source_timestamp = datetime.utcnow().isoformat()
        
        # Calculate hash with metadata for immutable lineage
        hash_with_metadata = calculate_hash_with_metadata(content_str, source_timestamp, agent_id)

        # Check if already ingested (by content hash)
        stmt = select(RawLog).where(RawLog.hash == file_hash)
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            raise ValueError(f"Log with hash {file_hash} already exists (ID: {existing.id})")

        # Auto-tagging: Map source/content to controls
        auto_tags = AutoTagger.auto_tag(source=source, filename=filename, content=content_str[:10000])
        control_ids = [tag["control_id"] for tag in auto_tags]
        reasoning_text = "; ".join([f"{tag['control_id']}: {tag['reasoning']}" for tag in auto_tags])
        
        # Store file
        safe_filename = f"{file_hash}_{filename}"
        file_path = settings.RAW_LOGS_PATH / safe_filename

        with open(file_path, 'wb') as f:
            f.write(file_content)

        # Enhanced metadata with lineage and auto-tagging
        enhanced_metadata = {
            **(metadata or {}),
            "hash_with_metadata": hash_with_metadata,
            "source_timestamp": source_timestamp,
            "agent_id": agent_id,
            "auto_tags": auto_tags,
            "control_ids": control_ids,
            "reasoning_for_mapping": reasoning_text,
            "embedding_vector": None  # Placeholder for future vector embedding
        }

        # Create database record
        raw_log = RawLog(
            hash=file_hash,
            source=source,
            filename=filename,
            file_path=str(file_path),
            content=content_str,
            size_bytes=len(file_content),
            description=description,
            meta_data=enhanced_metadata,
            ingested_at=datetime.utcnow()
        )

        session.add(raw_log)
        await session.commit()
        await session.refresh(raw_log)

        return raw_log

    @staticmethod
    async def ingest_document(
        session: AsyncSession,
        file_content: bytes,
        filename: str,
        doc_type: str,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        source_timestamp: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> RawDocument:
        """
        Ingest a document (PDF) into the Raw Vault with immutable lineage and auto-tagging

        Args:
            session: Database session
            file_content: Raw file content
            filename: Original filename
            doc_type: Document type (Policy, Audit Report, Config, etc.)
            description: Optional description
            metadata: Optional additional metadata
            source_timestamp: Optional ISO timestamp from source system
            agent_id: Optional ingestion agent ID

        Returns:
            RawDocument database record
        """
        # Calculate hash for immutability
        file_hash = calculate_content_hash(file_content)
        
        # Generate agent ID if not provided
        if not agent_id:
            agent_id = f"ingest-agent-{uuid.uuid4().hex[:8]}"
        
        # Use current timestamp if source timestamp not provided
        if not source_timestamp:
            source_timestamp = datetime.utcnow().isoformat()

        # Check if already ingested
        stmt = select(RawDocument).where(RawDocument.hash == file_hash)
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            raise ValueError(f"Document with hash {file_hash} already exists (ID: {existing.id})")

        # Store file
        safe_filename = f"{file_hash}_{filename}"
        file_path = settings.RAW_DOCUMENTS_PATH / safe_filename

        with open(file_path, 'wb') as f:
            f.write(file_content)

        # Extract text and metadata from PDF
        extracted_text = ""
        pdf_metadata = {}

        try:
            extracted_text = extract_text_from_pdf(file_path)
            pdf_metadata = extract_pdf_metadata(file_path)
        except Exception as e:
            print(f"Warning: Failed to extract PDF content: {e}")

        # Auto-tagging: Map doc_type/content to controls
        auto_tags = AutoTagger.auto_tag(source=doc_type, filename=filename, content=extracted_text[:10000] if extracted_text else "")
        control_ids = [tag["control_id"] for tag in auto_tags]
        reasoning_text = "; ".join([f"{tag['control_id']}: {tag['reasoning']}" for tag in auto_tags])
        
        # Calculate hash with metadata for immutable lineage
        content_for_hash = extracted_text if extracted_text else file_content.decode('utf-8', errors='ignore')
        hash_with_metadata = calculate_hash_with_metadata(content_for_hash, source_timestamp, agent_id)

        # Enhanced metadata with lineage and auto-tagging
        enhanced_metadata = {
            **(metadata or {}),
            **pdf_metadata,
            "hash_with_metadata": hash_with_metadata,
            "source_timestamp": source_timestamp,
            "agent_id": agent_id,
            "auto_tags": auto_tags,
            "control_ids": control_ids,
            "reasoning_for_mapping": reasoning_text,
            "embedding_vector": None  # Placeholder for future vector embedding
        }

        # Create database record
        raw_document = RawDocument(
            hash=file_hash,
            doc_type=doc_type,
            filename=filename,
            file_path=str(file_path),
            size_bytes=len(file_content),
            extracted_text=extracted_text,
            description=description,
            meta_data=enhanced_metadata,
            ingested_at=datetime.utcnow()
        )

        session.add(raw_document)
        await session.commit()
        await session.refresh(raw_document)

        return raw_document

    @staticmethod
    async def get_log_by_hash(session: AsyncSession, file_hash: str) -> Optional[RawLog]:
        """Retrieve log by hash"""
        stmt = select(RawLog).where(RawLog.hash == file_hash)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_document_by_hash(session: AsyncSession, file_hash: str) -> Optional[RawDocument]:
        """Retrieve document by hash"""
        stmt = select(RawDocument).where(RawDocument.hash == file_hash)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_logs(session: AsyncSession, limit: int = 100) -> list[RawLog]:
        """Get all logs"""
        stmt = select(RawLog).order_by(RawLog.ingested_at.desc()).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_all_documents(session: AsyncSession, limit: int = 100) -> list[RawDocument]:
        """Get all documents"""
        stmt = select(RawDocument).order_by(RawDocument.ingested_at.desc()).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def delete_log(session: AsyncSession, log_id: int) -> bool:
        """
        Delete a log and its associated evidence objects
        
        Args:
            session: Database session
            log_id: ID of the log to delete
            
        Returns:
            True if deleted successfully
        """
        from backend.database import EvidenceObject
        from pathlib import Path
        
        # Get the log
        stmt = select(RawLog).where(RawLog.id == log_id)
        result = await session.execute(stmt)
        raw_log = result.scalar_one_or_none()
        
        if not raw_log:
            raise ValueError(f"Log with ID {log_id} not found")
        
        # Delete associated evidence objects
        evidence_stmt = select(EvidenceObject).where(EvidenceObject.log_id == log_id)
        evidence_result = await session.execute(evidence_stmt)
        evidence_objects = list(evidence_result.scalars().all())
        for eo in evidence_objects:
            await session.delete(eo)
        
        # Delete the file
        file_path = Path(raw_log.file_path)
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to delete file {file_path}: {e}")
        
        # Delete the database record
        await session.delete(raw_log)
        await session.commit()
        
        return True

    @staticmethod
    async def delete_document(session: AsyncSession, document_id: int) -> bool:
        """
        Delete a document and its associated evidence objects
        
        Args:
            session: Database session
            document_id: ID of the document to delete
            
        Returns:
            True if deleted successfully
        """
        from backend.database import EvidenceObject
        from pathlib import Path
        
        # Get the document
        stmt = select(RawDocument).where(RawDocument.id == document_id)
        result = await session.execute(stmt)
        raw_document = result.scalar_one_or_none()
        
        if not raw_document:
            raise ValueError(f"Document with ID {document_id} not found")
        
        # Delete associated evidence objects
        evidence_stmt = select(EvidenceObject).where(EvidenceObject.document_id == document_id)
        evidence_result = await session.execute(evidence_stmt)
        evidence_objects = list(evidence_result.scalars().all())
        for eo in evidence_objects:
            await session.delete(eo)
        
        # Delete the file
        file_path = Path(raw_document.file_path)
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as e:
                print(f"Warning: Failed to delete file {file_path}: {e}")
        
        # Delete the database record
        await session.delete(raw_document)
        await session.commit()
        
        return True
