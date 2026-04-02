from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.core.security import create_access_token
from app.schemas.auth import Token
from app.services.user_service import authenticate_user

router = APIRouter(prefix='/auth', tags=['Authentication'])


@router.post('/login', response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return Token(access_token=token)
