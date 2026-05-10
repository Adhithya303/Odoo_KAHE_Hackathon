"""Auth service — password hashing, JWT creation, Google OAuth verification."""
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy.orm import Session
from app.config import settings
from app.models.user import User, RefreshToken
from app.models.preference import UserPreference
from app.models.destination import TripType
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: int, db: Session) -> str:
    raw_token = secrets.token_urlsafe(64)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    db_token = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(db_token)
    db.commit()
    return raw_token


def verify_refresh_token(raw_token: str, db: Session):
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.utcnow(),
    ).first()
    return db_token


def revoke_refresh_token(raw_token: str, db: Session):
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    db_token = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if db_token:
        db_token.revoked = True
        db.commit()


def generate_otp() -> str:
    return "".join([str(random.randint(0, 9)) for _ in range(6)])


def send_otp_email(email: str, otp: str):
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        print(f"SMTP not configured. OTP for {email} is {otp}")
        return
    
    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = email
    msg['Subject'] = "WanderIQ - Your OTP Verification Code"
    
    body = f"Your OTP verification code is: {otp}\nIt expires in 5 minutes."
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.send_message(msg)
        server.quit()
        print(f"OTP sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def register_user(db: Session, first_name: str, last_name: str, email: str, password: str, **kwargs) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("Email already registered")

    trip_scope = kwargs.pop("trip_scope", "Both")
    trip_types = kwargs.pop("trip_types", []) or []
    budget_tier = kwargs.pop("budget_tier", "Mid-range")
    min_budget = kwargs.pop("min_budget", None)
    max_budget = kwargs.pop("max_budget", None)

    otp = generate_otp()
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=hash_password(password),
        is_verified=False,
        otp_code=otp,
        otp_expires_at=datetime.utcnow() + timedelta(minutes=5),
        **{k: v for k, v in kwargs.items() if v is not None}
    )
    db.add(user)
    db.flush()

    if trip_scope or budget_tier or min_budget is not None or max_budget is not None or trip_types:
        pref = UserPreference(
            user_id=user.id,
            trip_scope=trip_scope,
            budget_tier=budget_tier,
            min_budget=min_budget,
            max_budget=max_budget,
        )
        db.add(pref)
        for type_name in trip_types:
            trip_type = db.query(TripType).filter(TripType.name == type_name).first()
            if trip_type:
                pref.trip_types.append(trip_type)

    db.commit()
    db.refresh(user)
    
    # Send email after successful commit
    send_otp_email(user.email, otp)
    
    return user


def verify_user_otp(db: Session, email: str, otp: str) -> bool:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    
    if user.otp_code != otp:
        return False
        
    if user.otp_expires_at < datetime.utcnow():
        return False
        
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    return True


def forgot_password(db: Session, email: str) -> bool:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
        
    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    db.commit()
    
    send_otp_email(email, otp)
    return True


def reset_password(db: Session, email: str, otp: str, new_password: str) -> bool:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
        
    if user.otp_code != otp:
        return False
        
    if user.otp_expires_at < datetime.utcnow():
        return False
        
    user.password_hash = hash_password(new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    return True



def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user
