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
    # Optional assessment session identifier to link this pack to a UI flow
    session_id: Optional[int] = None


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


class SwiftUserBackgroundData(BaseModel):
    """
    User background fields written into the 'User Background Data Sheet'
    worksheet of the CSCF Excel template.

    All fields are optional to keep the API backwards-compatible. When not
    provided, the corresponding cells in the template are left unchanged.
    """

    customer_name: Optional[str] = None
    bic: Optional[str] = None
    cscf_version: Optional[str] = None
    assessment_start_date: Optional[str] = None
    assessment_end_date: Optional[str] = None
    assessor_firm: Optional[str] = None
    lead_assessor_name: Optional[str] = None
    lead_assessor_title: Optional[str] = None
    assessor_names: Optional[str] = None
    # This is typically the SWIFT architecture type (A1, A2, A3, A4, B)
    architecture_type: Optional[str] = None


class SwiftExcelReportRequest(BaseModel):
    """Request to generate a SWIFT CSCF Excel report based on control status"""
    swift_architecture_type: Optional[str] = None
    control_statuses: List[SwiftControlStatus]
    # Optional assessment session identifier so the generated Excel can be tracked per session
    session_id: Optional[int] = None
    # Optional user background data for the User Background Data Sheet
    user_background: Optional[SwiftUserBackgroundData] = None


class TimelineEvent(BaseModel):
    """Single event in a control timeline (status or evidence activity)."""

    event_type: Literal[
        "status_change", "evidence_added", "evidence_removed", "assessment_milestone"
    ]
    control_id: str
    control_name: str
    timestamp: datetime

    # Status transition details (for status_change events)
    status_before: Optional[str] = None
    status_after: Optional[str] = None

    # Evidence context (for evidence_* events)
    evidence_id: Optional[int] = None
    evidence_filename: Optional[str] = None

    # Assessment context (for milestones)
    assessment_session_id: Optional[int] = None

    metadata: Optional[Dict[str, Any]] = None


class ControlTimelineResponse(BaseModel):
    """Response payload for control timeline queries."""

    control_id: Optional[str]
    time_range_start: datetime
    time_range_end: datetime
    events: List[TimelineEvent]
    summary: Dict[str, Any]


# Assessment Session Schemas


class AssessmentSessionBase(BaseModel):
    """Base fields for assessment session payloads"""

    status: Optional[str] = Field(
        default=None,
        description="Lifecycle status: in-progress, completed, cancelled",
    )
    current_step: Optional[int] = Field(
        default=None,
        description="Current step in the multi-step generate flow (1-8)",
    )

    objective_selection: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Step 1 selection payload (infrastructure, frameworks, objectives, etc.)",
    )
    swift_architecture_type: Optional[str] = Field(
        default=None,
        description="Selected SWIFT architecture type (A1, A2, A3, A4, B)",
    )
    requirements_status: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Step 3 requirements status/summary",
    )
    assessment_answers: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Step 5 compliance assessment answers",
    )
    control_statuses: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Step 6 derived control status information",
    )
    evidence_summary: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Step 4/7 evidence summary (counts, breakdowns, etc.)",
    )

    pack_id: Optional[str] = Field(
        default=None,
        description="Generated assurance pack ID associated with this session",
    )
    swift_excel_filename: Optional[str] = Field(
        default=None,
        description="Filename of SWIFT Excel generated for this session",
    )
    swift_excel_path: Optional[str] = Field(
        default=None,
        description="Filesystem path of SWIFT Excel generated for this session",
    )

    meta_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Arbitrary metadata for the session (e.g., UI environment, user info)",
    )


class AssessmentSessionCreate(BaseModel):
    """Create a new assessment session when user starts the generate flow"""

    objective_selection: Dict[str, Any] = Field(
        ...,
        description="Initial objective/framework/infrastructure selection",
    )
    swift_architecture_type: Optional[str] = Field(
        default=None,
        description="Optional SWIFT architecture type if already known at creation time",
    )


class AssessmentSessionUpdate(AssessmentSessionBase):
    """Partial update of an assessment session"""

    pass


class AssessmentSessionResponse(AssessmentSessionBase):
    """Full assessment session representation"""

    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas

class DashboardStats(BaseModel):
    """Statistics for dashboard"""
    total_logs: int
    total_documents: int
    total_evidence_objects: int
    total_assurance_packs: int
    recent_ingestions: int  # Last 24 hours
