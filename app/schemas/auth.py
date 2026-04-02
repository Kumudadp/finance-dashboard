from pydantic import BaseModel
from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class TokenPayload(BaseModel):
    sub: str
    role: UserRole
