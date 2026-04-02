from pydantic import BaseModel, model_validator
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from app.models.record import RecordType, RecordCategory


class RecordCreate(BaseModel):
    amount: Decimal
    type: RecordType
    category: RecordCategory
    date: date
    description: Optional[str] = None

    @model_validator(mode='after')
    def check_amount(self):
        if self.amount <= 0:
            raise ValueError('Amount must be greater than zero')
        # Round to 2 decimal places
        self.amount = self.amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return self


class RecordUpdate(BaseModel):
    amount: Optional[Decimal] = None
    type: Optional[RecordType] = None
    category: Optional[RecordCategory] = None
    date: Optional[date] = None
    description: Optional[str] = None

    @model_validator(mode='after')
    def check_amount(self):
        if self.amount is not None:
            if self.amount <= 0:
                raise ValueError('Amount must be greater than zero')
            # Round to 2 decimal places
            self.amount = self.amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return self


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