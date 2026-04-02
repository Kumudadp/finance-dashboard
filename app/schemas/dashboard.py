from pydantic import BaseModel
from decimal import Decimal
from typing import List
from app.models.record import RecordCategory


class CategoryTotal(BaseModel):
    category: RecordCategory
    total: Decimal


class MonthlySummary(BaseModel):
    month: str
    income: Decimal
    expense: Decimal
    net: Decimal


class DashboardSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    total_records: int
    category_totals: List[CategoryTotal]
    monthly_trends: List[MonthlySummary]
