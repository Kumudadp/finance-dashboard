from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.dependencies import get_db
from app.core.security import create_access_token
from app.schemas.auth import Token
from app.services.user_service import authenticate_user

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login with email and password.
    Returns a JWT access token valid for 24 hours.
    Rate limited to 10 attempts per minute.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return Token(access_token=token)
