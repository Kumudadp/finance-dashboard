from sqlalchemy.orm import Session
from sqlalchemy import func, case
from decimal import Decimal
from app.models.record import FinancialRecord, RecordType
from app.schemas.dashboard import DashboardSummary, CategoryTotal, MonthlySummary


def get_dashboard_summary(db: Session) -> DashboardSummary:
    base_query = db.query(FinancialRecord).filter(
        FinancialRecord.is_deleted == False
    )

    # --- Totals ---
    totals = db.query(
        func.coalesce(
            func.sum(
                case((FinancialRecord.type == RecordType.income, FinancialRecord.amount), else_=0)
            ), 0
        ).label('total_income'),
        func.coalesce(
            func.sum(
                case((FinancialRecord.type == RecordType.expense, FinancialRecord.amount), else_=0)
            ), 0
        ).label('total_expenses'),
        func.count(FinancialRecord.id).label('total_records'),
    ).filter(FinancialRecord.is_deleted == False).one()

    total_income = Decimal(str(totals.total_income))
    total_expenses = Decimal(str(totals.total_expenses))
    net_balance = total_income - total_expenses

    # --- Category totals (all records, grouped) ---
    category_rows = (
        db.query(
            FinancialRecord.category,
            func.sum(FinancialRecord.amount).label('total'),
        )
        .filter(FinancialRecord.is_deleted == False)
        .group_by(FinancialRecord.category)
        .order_by(func.sum(FinancialRecord.amount).desc())
        .all()
    )
    category_totals = [
        CategoryTotal(
            category=row.category,
            total=Decimal(str(row.total)),
        )
        for row in category_rows
    ]

    # --- Monthly trends ---
    monthly_rows = (
        db.query(
            func.to_char(FinancialRecord.date, 'YYYY-MM').label('month'),
            func.coalesce(
                func.sum(
                    case((FinancialRecord.type == RecordType.income, FinancialRecord.amount), else_=0)
                ), 0
            ).label('income'),
            func.coalesce(
                func.sum(
                    case((FinancialRecord.type == RecordType.expense, FinancialRecord.amount), else_=0)
                ), 0
            ).label('expense'),
        )
        .filter(FinancialRecord.is_deleted == False)
        .group_by(func.to_char(FinancialRecord.date, 'YYYY-MM'))
        .order_by(func.to_char(FinancialRecord.date, 'YYYY-MM'))
        .all()
    )

    monthly_trends = [
        MonthlySummary(
            month=row.month,
            income=Decimal(str(row.income)),
            expense=Decimal(str(row.expense)),
            net=Decimal(str(row.income)) - Decimal(str(row.expense)),
        )
        for row in monthly_rows
    ]

    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        total_records=totals.total_records,
        category_totals=category_totals,
        monthly_trends=monthly_trends,
    )
