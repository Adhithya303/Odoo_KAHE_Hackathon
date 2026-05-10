"""Auth router — registration, login, token refresh, password reset."""
from fastapi import APIRouter, Depends, HTTPException, status, Response
import httpx
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshRequest,
    ForgotPasswordRequest, ResetPasswordRequest, UserResponse, UserUpdateRequest,
    ChangePasswordRequest, VerifyOtpRequest, GoogleAuthRequest,
)
from app.services.auth_service import (
    register_user, authenticate_user, create_access_token, create_refresh_token,
    verify_refresh_token, revoke_refresh_token, hash_password, verify_password,
    verify_user_otp, forgot_password as service_forgot_password, reset_password as service_reset_password,
)
from app.dependencies import get_current_user
from app.config import settings
from app.models.user import User
from app.models.preference import UserPreference
from app.models.destination import TripType, GroupType
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(
            db, req.first_name, req.last_name, req.email, req.password,
            phone=req.phone,
            city=req.city,
            country=req.country,
            profile_photo_url=req.profile_photo_url,
            emergency_contact_name=req.emergency_contact_name,
            emergency_contact_phone=req.emergency_contact_phone,
            emergency_contact_relation=req.emergency_contact_relation,
            trip_scope=req.trip_scope,
            trip_types=req.trip_types,
            budget_tier=req.budget_tier,
            min_budget=req.min_budget,
            max_budget=req.max_budget,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id, db)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id, db)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    success = verify_user_otp(db, req.email, req.otp)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password_route(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    success = service_forgot_password(db, req.email)
    if not success:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"message": "OTP sent to email"}


@router.post("/reset-password")
def reset_password_route(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    success = service_reset_password(db, req.email, req.otp, req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "Password reset successfully"}


@router.post("/google", response_model=TokenResponse)
async def google_login(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Verify token with Google
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={req.id_token}")
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        payload = resp.json()

    if settings.GOOGLE_CLIENT_ID and payload.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")
        
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in Google token")
        
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account does not exist. Please sign up first.")
        
    # Log user in
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id, db)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh")
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    db_token = verify_refresh_token(req.refresh_token, db)
    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    revoke_refresh_token(req.refresh_token, db)
    new_access = create_access_token(db_token.user_id)
    new_refresh = create_refresh_token(db_token.user_id, db)

    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}


@router.post("/logout")
def logout(req: RefreshRequest, db: Session = Depends(get_db)):
    revoke_refresh_token(req.refresh_token, db)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


@router.put("/me", response_model=UserResponse)
def update_me(req: UserUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


class PreferenceRequest(BaseModel):
    trip_scope: Optional[str] = "Both"
    budget_tier: Optional[str] = "Mid-range"
    min_budget: Optional[int] = None
    max_budget: Optional[int] = None
    trip_types: List[str] = []
    group_types: List[str] = []


@router.post("/me/preferences")
def save_preferences(req: PreferenceRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.add(pref)

    pref.trip_scope = req.trip_scope
    pref.budget_tier = req.budget_tier
    pref.min_budget = req.min_budget
    pref.max_budget = req.max_budget

    # Update trip types
    pref.trip_types = []
    for type_name in req.trip_types:
        tt = db.query(TripType).filter(TripType.name == type_name).first()
        if tt:
            pref.trip_types.append(tt)

    # Update group types
    pref.group_types = []
    for group_name in req.group_types:
        gt = db.query(GroupType).filter(GroupType.name == group_name).first()
        if gt:
            pref.group_types.append(gt)

    db.commit()
    return {"message": "Preferences saved", "has_preferences": True}


@router.get("/me/preferences")
def get_preferences(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        return {"has_preferences": False}

    return {
        "has_preferences": True,
        "trip_scope": pref.trip_scope,
        "budget_tier": pref.budget_tier,
        "min_budget": pref.min_budget,
        "max_budget": pref.max_budget,
        "trip_types": [t.name for t in pref.trip_types],
        "group_types": [g.name for g in pref.group_types],
    }
