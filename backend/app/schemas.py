from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRole(str, Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"


class TokenPayload(BaseModel):
    sub: str
    role: str


class UserCreate(BaseModel):
    email: EmailStr
    phone: str | None = None
    full_name: str
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.PATIENT


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    phone: str | None = None
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class PatientProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    date_of_birth: date | None = None
    gender: str | None = None
    abha_id: str | None = None
    blood_group: str | None = None
    emergency_contact: str | None = None
    address: str | None = None
    preferred_language: str = "en"
    consent_version: str | None = None


class ClinicalHistoryCreate(BaseModel):
    chief_complaint: str | None = None
    hpi: str | None = None
    past_medical_history: str | None = None
    surgical_history: str | None = None
    family_history: str | None = None
    personal_history: str | None = None
    review_of_systems: str | None = None
    structured_data: dict[str, Any] | None = None


class HistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    chief_complaint: str | None = None
    hpi: str | None = None
    past_medical_history: str | None = None
    surgical_history: str | None = None
    family_history: str | None = None
    personal_history: str | None = None
    review_of_systems: str | None = None
    structured_data: dict[str, Any] | None = None
    updated_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
