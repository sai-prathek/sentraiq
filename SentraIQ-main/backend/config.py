"""
Configuration management for SentralQ application
"""
from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "SentralQ"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sentraiq.db"

    # Storage Paths
    BASE_PATH: Path = Path(__file__).parent.parent
    STORAGE_PATH: Path = BASE_PATH / "storage"
    RAW_LOGS_PATH: Path = STORAGE_PATH / "raw_logs"
    RAW_DOCUMENTS_PATH: Path = STORAGE_PATH / "raw_documents"
    ASSURANCE_PACKS_PATH: Path = STORAGE_PATH / "assurance_packs"

    # OpenAI (Optional for Telescope)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4.1-mini"

    # Security
    SECRET_KEY: str = "change-this-in-production"

    # Regulatory Controls Mapping (simplified for POC)
    CONTROL_MAPPINGS: dict = {
        "MFA": {
            "control_id": "AC-001",
            "name": "Multi-Factor Authentication",
            "description": "Enforce MFA for all SWIFT terminal access",
            "keywords": ["mfa", "two-factor", "2fa", "authentication", "login"]
        },
        "ACCESS_CONTROL": {
            "control_id": "AC-002",
            "name": "Access Control",
            "description": "Restrict access to authorized personnel only",
            "keywords": ["access", "authorization", "permission", "denied", "failed"]
        },
        "ENCRYPTION": {
            "control_id": "CR-001",
            "name": "Data Encryption",
            "description": "Encrypt all payment data in transit and at rest",
            "keywords": ["encryption", "tls", "ssl", "encrypted", "cipher"]
        },
        "AUDIT_LOGGING": {
            "control_id": "AU-001",
            "name": "Audit Logging",
            "description": "Maintain comprehensive audit logs",
            "keywords": ["audit", "log", "record", "event", "activity"]
        }
    }

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Initialize settings
settings = Settings()

# Create storage directories
settings.RAW_LOGS_PATH.mkdir(parents=True, exist_ok=True)
settings.RAW_DOCUMENTS_PATH.mkdir(parents=True, exist_ok=True)
settings.ASSURANCE_PACKS_PATH.mkdir(parents=True, exist_ok=True)
