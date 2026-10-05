from pathlib import Path
import shutil
import uuid

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from pydantic import BaseModel
from sqlalchemy.orm import Session

try:
    from backend.services.document_processor.pipeline import MedicalDocumentPipeline
except ModuleNotFoundError:  # pragma: no cover
    from services.document_processor.pipeline import MedicalDocumentPipeline

from .config import settings
from .database import create_db_and_tables, get_db
from .models import User, UserRole
from .schemas import Token, UserCreate, UserLogin, UserRead
from .security import create_access_token, decode_access_token, hash_password, verify_password

app = FastAPI(title=settings.app_name, version=settings.app_version)

@app.on_event("startup")
def startup_event() -> None:
    create_db_and_tables()
    settings.document_storage_dir.mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@app.post("/documents/extract")
async def extract_document(file: UploadFile = File(...), db: Session = Depends(get_db)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided")

    extension = Path(file.filename).suffix.lower()
    if extension not in settings.allowed_document_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type. Upload a PDF, JPG, JPEG, or PNG document.")

    allowed_content_types = {"application/pdf", "image/png", "image/jpeg", "image/jpg"}
    if file.content_type and file.content_type not in allowed_content_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported MIME type for medical document upload.")

    target_dir = settings.document_storage_dir
    target_dir.mkdir(parents=True, exist_ok=True)
    temp_path = target_dir / f"{uuid.uuid4()}_{file.filename}"
    with temp_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"[DOCUMENT] filename={file.filename}")
    print(f"[DOCUMENT] MIME type={file.content_type or 'unknown'}")
    print(f"[DOCUMENT] file size={temp_path.stat().st_size}")

    try:
        pipeline = MedicalDocumentPipeline()
        result = pipeline.process_file(str(temp_path))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unable to process document.") from exc
    finally:
        if temp_path.exists():
            temp_path.unlink()

    status_value = result.get("status", "needs_review")
    if status_value == "error":
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=result.get("error") or "Unable to reliably extract information from this document.")

    result["document"]["type"] = result.get("document", {}).get("type") or "unknown"
    response = {
        "file_name": file.filename,
        "content_type": file.content_type or "application/octet-stream",
        "status": status_value,
        "warnings": result.get("warnings", []),
        "raw_ocr_text": result.get("raw_ocr_text", ""),
        "extracted_information": result.get("extracted_information", result),
        "result": result,
    }
    return response


@app.post("/auth/register", response_model=UserRead)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email.lower(),
        phone=payload.phone,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role=payload.role.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(user.id), role=user.role)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me")
def get_current_user_profile(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> dict[str, str]:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return {"id": str(user.id), "role": user.role, "email": user.email, "name": user.full_name}
