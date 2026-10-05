import os
from pathlib import Path
from typing import List


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    app_name: str = "MediKiosk API"
    app_version: str = "0.1.0"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./medikiosk.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ai_provider: str = os.getenv("AI_PROVIDER", "mock")
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    ocr_provider: str = os.getenv("OCR_PROVIDER", "mock")
    storage_provider: str = os.getenv("STORAGE_PROVIDER", "local")
    storage_bucket: str = os.getenv("STORAGE_BUCKET", "medikiosk-documents")
    document_storage_dir: Path = Path(os.getenv("DOCUMENT_STORAGE_DIR", "./documents"))
    allowed_document_types: set[str] = {".pdf", ".png", ".jpg", ".jpeg"}
    cors_origins: List[str] = _split_csv(os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"))


settings = Settings()
settings.document_storage_dir.mkdir(parents=True, exist_ok=True)
