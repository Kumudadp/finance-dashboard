from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from app.models.record import FinancialRecord
from app.schemas.record import RecordCreate, RecordUpdate, RecordFilter


def create_record(db: Session, data: RecordCreate, user_id: UUID) -> FinancialRecord:
    record = FinancialRecord(
        amount=data.amount,
        type=data.type,
        category=data.category,
        date=data.date,
        description=data.description,
        user_id=user_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_records(
    db: Session,
    filters: RecordFilter,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[FinancialRecord], int]:
    query = db.query(FinancialRecord).filter(
        FinancialRecord.is_deleted == False
    )
    if filters.type:
        query = query.filter(FinancialRecord.type == filters.type)
    if filters.category:
        query = query.filter(FinancialRecord.category == filters.category)
    if filters.date_from:
        query = query.filter(FinancialRecord.date >= filters.date_from)
    if filters.date_to:
        query = query.filter(FinancialRecord.date <= filters.date_to)
    if filters.search:
        query = query.filter(
            FinancialRecord.description.ilike(f'%{filters.search}%')
        )
    total = query.count()
    records = (
        query.order_by(FinancialRecord.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return records, total


def get_record_by_id(db: Session, record_id: UUID) -> FinancialRecord:
    record = db.query(FinancialRecord).filter(
        FinancialRecord.id == record_id,
        FinancialRecord.is_deleted == False,
    ).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Record not found',
        )
    return record


def update_record(
    db: Session,
    record_id: UUID,
    data: RecordUpdate,
) -> FinancialRecord:
    record = get_record_by_id(db, record_id)
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='No fields provided for update',
        )
    for field, value in update_data.items():
        setattr(record, field, value)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def soft_delete_record(db: Session, record_id: UUID) -> dict:
    record = get_record_by_id(db, record_id)
    record.is_deleted = True
    db.add(record)
    db.commit()
    return {'message': 'Record deleted successfully'}