from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from app.models.record import RecordType, RecordCategory


class RecordCreate(BaseModel):
    amount: Decimal
    type: RecordType
    category: RecordCategory
    date: date
    description: Optional[str] = None


class RecordUpdate(BaseModel):
    amount: Optional[Decimal] = None
    type: Optional[RecordType] = None
    category: Optional[RecordCategory] = None
    description: Optional[str] = None


class RecordResponse(BaseModel):
    id: UUID
    amount: Decimal
    type: RecordType
    category: RecordCategory
    date: date
    description: Optional[str] = None
    is_deleted: bool
    user_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}


class RecordFilter(BaseModel):
    type: Optional[RecordType] = None
    category: Optional[RecordCategory] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    search: Optional[str] = None