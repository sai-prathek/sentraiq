"""
Demo Data Router - Serves sample files for testing
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()

DATA_DIR = Path("data")
SAMPLE_LOGS_DIR = DATA_DIR / "sample_logs"
SAMPLE_POLICIES_DIR = DATA_DIR / "sample_policies"

@router.get("/logs")
async def list_demo_logs():
    """List available demo log files"""
    if not SAMPLE_LOGS_DIR.exists():
        return []

    files = []
    for file_path in SAMPLE_LOGS_DIR.glob("*.log"):
        files.append({
            "name": file_path.name,
            "size": file_path.stat().st_size,
            "path": f"/data/sample_logs/{file_path.name}"
        })
    return files

@router.get("/documents")
async def list_demo_documents():
    """List available demo document files"""
    if not SAMPLE_POLICIES_DIR.exists():
        return []

    files = []
    for pattern in ["*.pdf", "*.txt"]:
        for file_path in SAMPLE_POLICIES_DIR.glob(pattern):
            files.append({
                "name": file_path.name,
                "size": file_path.stat().st_size,
                "path": f"/data/sample_policies/{file_path.name}"
            })
    return files

@router.get("/logs/{filename}")
async def get_demo_log(filename: str):
    """Download a demo log file"""
    file_path = SAMPLE_LOGS_DIR / filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Demo log file not found")

    return FileResponse(
        path=file_path,
        media_type="text/plain",
        filename=filename
    )

@router.get("/documents/{filename}")
async def get_demo_document(filename: str):
    """Download a demo document file"""
    file_path = SAMPLE_POLICIES_DIR / filename

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Demo document file not found")

    # Determine media type based on extension
    media_type = "application/pdf" if filename.endswith(".pdf") else "text/plain"

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )
