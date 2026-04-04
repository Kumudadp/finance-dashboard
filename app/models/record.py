import uuid
from sqlalchemy import (
    Column, String, Numeric, Enum as SAEnum,
    Date, Text, Boolean, ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin


class RecordType(str, enum.Enum):
    income = 'income'
    expense = 'expense'


class RecordCategory(str, enum.Enum):
    salary = 'salary'
    investment = 'investment'
    rent = 'rent'
    utilities = 'utilities'
    food = 'food'
    transport = 'transport'
    healthcare = 'healthcare'
    entertainment = 'entertainment'
    tax = 'tax'
    other = 'other'


class FinancialRecord(Base, TimestampMixin):
    __tablename__ = 'financial_records'

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    type = Column(SAEnum(RecordType, name='recordtype'), nullable=False)
    category = Column(SAEnum(RecordCategory, name='recordcategory'), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
    )
    created_by = relationship('User', back_populates='records')

    __table_args__ = (
        Index('ix_records_user_date', 'user_id', 'date'),
        Index('ix_records_type', 'type'),
        Index('ix_records_category', 'category'),
        Index('ix_records_is_deleted', 'is_deleted'),
    )

    def __repr__(self):
        return f'<FinancialRecord {self.type} | {self.amount} | {self.category}>'
