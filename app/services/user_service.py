from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password


def create_user(db: Session, data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='A user with this email already exists',
        )
    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_all_users(db: Session) -> list[User]:
    # Return ALL users including inactive so admin can manage them
    return db.query(User).order_by(User.created_at.desc()).all()


def get_user_by_id(db: Session, user_id: UUID) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )
    return user


def update_user(db: Session, user_id: UUID, data: UserUpdate) -> User:
    user = get_user_by_id(db, user_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user_id: UUID) -> User:
    user = get_user_by_id(db, user_id)
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: UUID) -> User:
    user = get_user_by_id(db, user_id)
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password',
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Account is inactive. Contact your administrator.',
        )
    return user
def delete_user(db: Session, user_id: UUID) -> dict:
    user = get_user_by_id(db, user_id)
    db.delete(user)
    db.commit()
    return {'message': 'User deleted successfully'}