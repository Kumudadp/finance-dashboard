from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.middleware.rbac import require_any_role
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import get_dashboard_summary
from app.models.user import User

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])


@router.get(
    '/summary',
    response_model=DashboardSummary,
    summary='Get dashboard summary (All roles)',
)
def dashboard_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_any_role),
):
    """
    Returns aggregated financial data:
    - Total income, expenses, net balance
    - Category-wise totals
    - Monthly income vs expense trends
    """
    return get_dashboard_summary(db)
