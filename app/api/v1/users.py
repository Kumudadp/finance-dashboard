from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.dependencies import get_db
from app.middleware.rbac import require_admin
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services import user_service
from app.models.user import User

router = APIRouter(prefix='/users', tags=['Users'])


@router.post('/', response_model=UserResponse, status_code=201)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.create_user(db, data)


@router.get('/', response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.get_all_users(db)


@router.get('/{user_id}', response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.get_user_by_id(db, user_id)


@router.patch('/{user_id}', response_model=UserResponse)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.update_user(db, user_id, data)


@router.patch('/{user_id}/activate', response_model=UserResponse)
def activate_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.activate_user(db, user_id)


@router.patch('/{user_id}/deactivate', response_model=UserResponse)
def deactivate_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.deactivate_user(db, user_id)

@router.delete('/{user_id}')
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.delete_user(db, user_id)