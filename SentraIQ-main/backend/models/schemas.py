"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List, Literal


# Layer 1: Raw Vault Schemas

class LogIngestResponse(BaseModel):
    """Response after ingesting a log file"""
    id: int
    hash: str
    source: str
    filename: str
    size_bytes: int
    ingested_at: datetime
    message: str = "Log ingested successfully"


class DocumentIngestResponse(BaseModel):
    """Response after ingesting a document"""
    id: int
    hash: str
    doc_type: str
    filename: str
    size_bytes: int
    page_count: Optional[int] = None
    ingested_at: datetime
    message: str = "Document ingested successfully"


# Layer 2: Dojo Mapper Schemas

class EvidenceLinkage(BaseModel):
    """Evidence object linking log to document"""
    id: int
    control_id: str
    control_name: str
    log_id: Optional[int] = None
    document_id: Optional[int] = None
    linkage_score: float
    linkage_reason: str
    created_at: datetime


class MappingResult(BaseModel):
    """Result of Dojo Mapper processing"""
    evidence_objects_created: int
    linkages: List[EvidenceLinkage]
    processing_time_ms: int


# Layer 3: Telescope Schemas

class TelescopeQueryRequest(BaseModel):
    """Request for natural language query"""
    query: str = Field(..., description="Natural language query for evidence")
    time_range_start: Optional[datetime] = None
    time_range_end: Optional[datetime] = None


class EvidenceItem(BaseModel):
    """Single evidence item in query results"""
    type: str  # "log" or "document"
    id: int
    hash: str
    filename: str
    content_preview: str
    relevance_score: float
    control_id: Optional[str] = None
    ingested_at: datetime


class TelescopeQueryResponse(BaseModel):
    """Response from Telescope query"""
    query: str
    interpreted_intent: str
    results_count: int
    evidence_items: List[EvidenceItem]
    execution_time_ms: int
    ai_summary: Optional[str] = Field(
        default=None,
        description="Optional AI-generated natural language summary of the evidence set"
    )
    gap_analysis: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Gap analysis results comparing evidence to assessment questions"
    )


# Assurance Pack Schemas

class AssurancePackRequest(BaseModel):
    """Request to generate assurance pack"""
    control_id: Optional[str] = None
    query: Optional[str] = None
    time_range_start: datetime
    time_range_end: datetime
    include_documents: bool = True
    include_logs: bool = True
    # Optional explicit evidence IDs to always include in the pack
    # These are in addition to whatever the Telescope query finds
    explicit_log_ids: Optional[List[int]] = None
    explicit_document_ids: Optional[List[int]] = None
    # Assessment answers from compliance questions
    assessment_answers: Optional[List[Dict[str, Any]]] = None


class AssurancePackResponse(BaseModel):
    """Response with assurance pack details"""
    pack_id: str
    control_id: Optional[str] = None
    evidence_count: int
    pack_hash: str
    file_path: str
    download_url: str
    created_at: datetime
    report_url: Optional[str] = None
    disclaimer: str = (
        "This assurance pack supports attestation readiness by providing "
        "structured, time-bound evidence. It does not constitute certification, "
        "regulatory approval, or compliance sign-off."
    )


class SwiftControlStatus(BaseModel):
    """Per-control status used for SWIFT Excel assessments"""
    control_id: str
    status: Literal["in-place", "not-in-place", "not-applicable"]
    advisory: bool = False
    # Optional human-readable summary that can be written into the Excel sheet
    answer_summary: Optional[str] = None


class SwiftExcelReportRequest(BaseModel):
    """Request to generate a SWIFT CSCF Excel report based on control status"""
    swift_architecture_type: Optional[str] = None
    control_statuses: List[SwiftControlStatus]


# Dashboard Schemas

class DashboardStats(BaseModel):
    """Statistics for dashboard"""
    total_logs: int
    total_documents: int
    total_evidence_objects: int
    total_assurance_packs: int
    recent_ingestions: int  # Last 24 hours
