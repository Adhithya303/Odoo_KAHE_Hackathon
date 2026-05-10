"""Auth Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal, List


class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    profile_photo_url: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    trip_scope: Literal["Domestic", "International", "Both"] = "Both"
    trip_types: List[str] = Field(default_factory=list)
    budget_tier: Literal["Budget", "Mid-range", "Premium"] = "Mid-range"
    min_budget: Optional[int] = None
    max_budget: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=8)


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    profile_photo_url: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    profile_photo_url: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# Fix forward reference
TokenResponse.model_rebuild()
