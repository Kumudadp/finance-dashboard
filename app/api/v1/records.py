from fastapi import APIRouter, Depends, Query
from fastapi.routing import APIRoute
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from datetime import date
from app.core.dependencies import get_db
from app.middleware.rbac import require_admin, require_analyst_or_above
from app.schemas.record import RecordCreate, RecordUpdate, RecordResponse, RecordFilter
from app.services import record_service
from app.models.user import User
from app.models.record import RecordType, RecordCategory

router = APIRouter(prefix='/records', tags=['Financial Records'])


@router.post('/', response_model=RecordResponse, status_code=201)
def create_record(
    data: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return record_service.create_record(db, data, current_user.id)


@router.get('/', response_model=dict)
def list_records(
    db: Session = Depends(get_db),
    _: User = Depends(require_analyst_or_above),
    type: Optional[RecordType] = Query(None),
    category: Optional[RecordCategory] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    filters = RecordFilter(
        type=type,
        category=category,
        date_from=date_from,
        date_to=date_to,
        search=search,
    )
    skip = (page - 1) * page_size
    records, total = record_service.get_records(db, filters, skip, page_size)
    return {
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': -(-total // page_size),
        'data': [RecordResponse.model_validate(r) for r in records],
    }


@router.get('/{record_id}', response_model=RecordResponse)
def get_record(
    record_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_analyst_or_above),
):
    return record_service.get_record_by_id(db, record_id)


@router.patch('/{record_id}', response_model=RecordResponse)
def update_record(
    record_id: UUID,
    data: RecordUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return record_service.update_record(db, record_id, data)


@router.delete('/{record_id}')
def delete_record(
    record_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return record_service.soft_delete_record(db, record_id)