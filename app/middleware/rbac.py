from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.core.dependencies import get_current_user


def require_roles(*roles: UserRole):
    """
    Dependency factory for role-based access control.
    Usage: Depends(require_roles(UserRole.admin))
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f'Access denied. Required roles: {[r.value for r in roles]}',
            )
        return current_user
    return role_checker


# --- Role Guards (use these in routes) ---

# Only admin
require_admin = require_roles(UserRole.admin)

# Admin + Analyst (can read records and summaries)
require_analyst_or_above = require_roles(UserRole.admin, UserRole.analyst)

# All roles including viewer (dashboard only)
require_any_role = require_roles(UserRole.admin, UserRole.analyst, UserRole.viewer)
