"""
SentralQ - Main FastAPI Application
Hybrid Evidence Lakehouse for Payment Systems
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from backend.database import init_db
from backend.config import settings
from backend.routers import ingestion, evidence, assurance, dashboard, demo


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    await init_db()
    print("✅ Database initialized")
    yield
    print("🔻 Shutting down")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Hybrid Evidence Lakehouse for Payment Systems - Automated Assurance",
    lifespan=lifespan
)

# CORS middleware - Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://*.onrender.com",  # Render deployments
        "https://*.vercel.app",  # Vercel deployments
        "*"  # Allow all for now (tighten in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingestion.router, prefix=f"{settings.API_V1_PREFIX}/ingest", tags=["Layer 1: Ingestion"])
app.include_router(evidence.router, prefix=f"{settings.API_V1_PREFIX}/evidence", tags=["Layer 2: Evidence"])
app.include_router(assurance.router, prefix=f"{settings.API_V1_PREFIX}/assurance", tags=["Layer 3: Assurance"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_PREFIX}/dashboard", tags=["Dashboard"])
app.include_router(demo.router, prefix=f"{settings.API_V1_PREFIX}/demo", tags=["Demo Data"])

# Serve data files for demo
app.mount("/data", StaticFiles(directory="data"), name="data")


# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/debug/frontend-paths")
async def debug_frontend_paths():
    """Debug endpoint to check frontend path resolution"""
    from pathlib import Path
    import os

    cwd = Path.cwd()
    base_path = settings.BASE_PATH

    # Check all three path options
    react_build_relative = Path("frontend/sentraiq-dashboard/dist")
    react_build_absolute = base_path / "frontend" / "sentraiq-dashboard" / "dist"
    react_build_backend_static = Path("backend/static")

    # Helper to get directory contents
    def get_dir_contents(path: Path, max_depth=2, current_depth=0):
        if not path.exists() or current_depth >= max_depth:
            return None
        try:
            return {
                "exists": True,
                "is_dir": path.is_dir(),
                "children": [
                    {
                        "name": item.name,
                        "is_dir": item.is_dir(),
                        "size": item.stat().st_size if item.is_file() else None
                    }
                    for item in path.iterdir()
                ] if path.is_dir() else None
            }
        except Exception as e:
            return {"error": str(e)}

    # Check for frontend_mounted variable from module scope
    frontend_is_mounted = globals().get('frontend_mounted', False)

    return {
        "current_working_directory": str(cwd),
        "base_path_from_settings": str(base_path),
        "base_path_exists": base_path.exists(),
        "paths_checked": {
            "relative_path": {
                "path": str(react_build_relative),
                "absolute": str(react_build_relative.absolute()),
                "exists": react_build_relative.exists(),
                "details": get_dir_contents(react_build_relative) if react_build_relative.exists() else None
            },
            "base_path_relative": {
                "path": str(react_build_absolute),
                "exists": react_build_absolute.exists(),
                "details": get_dir_contents(react_build_absolute) if react_build_absolute.exists() else None
            },
            "backend_static": {
                "path": str(react_build_backend_static),
                "absolute": str(react_build_backend_static.absolute()),
                "exists": react_build_backend_static.exists(),
                "details": get_dir_contents(react_build_backend_static) if react_build_backend_static.exists() else None
            }
        },
        "parent_directories": {
            "frontend_dir": {
                "path": "frontend",
                "exists": Path("frontend").exists(),
                "contents": get_dir_contents(Path("frontend")) if Path("frontend").exists() else None
            },
            "sentraiq_dashboard_dir": {
                "path": "frontend/sentraiq-dashboard",
                "exists": Path("frontend/sentraiq-dashboard").exists(),
                "contents": [item.name for item in Path("frontend/sentraiq-dashboard").iterdir()] if Path("frontend/sentraiq-dashboard").exists() else []
            },
            "root_contents": {
                "entries": [item.name for item in cwd.iterdir()][:20]  # First 20 items
            }
        },
        "environment": {
            "PYTHONPATH": os.environ.get("PYTHONPATH"),
            "PWD": os.environ.get("PWD"),
        },
        "frontend_mounted": False  # Frontend served separately
    }


@app.get("/")
async def root():
    """Root endpoint - Frontend is served separately"""
    from fastapi.responses import JSONResponse
    return JSONResponse({
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "API Running",
        "message": "Frontend deployed separately. API endpoints at /api/v1/*",
        "docs": "/docs",
        "health": "/health",
        "frontend_url": "https://sentraiq.vercel.app"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
