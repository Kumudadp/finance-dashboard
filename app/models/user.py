import uuid
from sqlalchemy import Column, String, Boolean, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    admin = 'admin'
    analyst = 'analyst'
    viewer = 'viewer'


class User(Base, TimestampMixin):
    __tablename__ = 'users'

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        SAEnum(UserRole, name='userrole'),
        nullable=False,
        default=UserRole.viewer,
    )
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationship — one user can have many financial records
    records = relationship(
        'FinancialRecord',
        back_populates='created_by',
        lazy='dynamic',
    )

    def __repr__(self):
        return f'<User {self.email} | {self.role}>'
