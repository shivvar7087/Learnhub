import re
import secrets
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .rate_limits import limiter
from .schemas import AuthResponse, AuthUserOut, LoginRequest, ProfileUpdate, RegisterRequest
from .security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(24))


def account_json(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone or "",
        "role": user.role,
        "isAdmin": user.role == "admin",
    }


def auth_response(user: User) -> dict:
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": account_json(user)}


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
def register(request: Request, response: Response, payload: RegisterRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    name = payload.name.strip()
    if not EMAIL_PATTERN.fullmatch(email):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Enter your full name.")
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account already exists for this email.")
    user = User(
        id=str(uuid4()),
        name=name,
        email=email,
        password_hash=hash_password(payload.password),
        role="student",
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account already exists for this email.")
    db.refresh(user)
    return auth_response(user)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, response: Response, payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email)) if EMAIL_PATTERN.fullmatch(email) else None
    stored_hash = user.password_hash if user else DUMMY_PASSWORD_HASH
    if user is None or not verify_password(payload.password, stored_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return auth_response(user)


@router.get("/me", response_model=AuthUserOut)
def current_account(user: User = Depends(get_current_user)):
    return account_json(user)


@router.patch("/me", response_model=AuthUserOut)
def update_account(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    values = payload.model_dump(exclude_unset=True)
    if "email" in values:
        email = values["email"].lower()
        if not EMAIL_PATTERN.fullmatch(email):
            raise HTTPException(status_code=422, detail="Enter a valid email address.")
        conflict = db.scalar(select(User.id).where(User.email == email, User.id != user.id))
        if conflict:
            raise HTTPException(status_code=409, detail="An account already exists for this email.")
        values["email"] = email
    for field, value in values.items():
        setattr(user, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account already exists for this email.")
    db.refresh(user)
    return account_json(user)
