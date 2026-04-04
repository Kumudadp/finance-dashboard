# Finance Dashboard API

A production-ready role-based finance dashboard backend built with FastAPI, PostgreSQL, and React.

---
## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://finance-dashboard-plum-delta.vercel.app/ |
| Backend | https://finance-dashboard-na1y.onrender.com/docs |

### Demo Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@finance.com      | Admin1234  |
| Analyst | analyst@finance.com    | Analyst1234 |
| Viewer  | viewer@finance.com     | Viewer1234 |

---
## Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Backend    | Python 3.11, FastAPI           |
| Database   | PostgreSQL 16 + SQLAlchemy ORM |
| Migrations | Alembic                        |
| Auth       | JWT (python-jose) + bcrypt     |
| Validation | Pydantic v2                    |
| Frontend   | React 18 + Vite + Recharts     |
| Deployment | Render (API) + Vercel (UI)     |

---

## Architecture
```
finance-dashboard/ 
│
├── app/ 
│ ├── api/v1/ # Route handlers (HTTP layer only) 
│ ├── core/ # Config, security, JWT, dependencies 
│ ├── db/ # Database session and base models 
│ ├── models/ # SQLAlchemy ORM models 
│ ├── schemas/ # Pydantic request/response schemas 
│ ├── services/ # Business logic layer 
│ ├── middleware/ # RBAC access control 
│ └── main.py # App entry point 
├── alembic/ # Database migrations 
├── frontend/ # React + Vite UI 
├── tests/ # Test cases 
├── seed.py # Demo data seeder 
├── requirements.txt 
├── alembic.ini 
├── README.md 
```
---
The project follows strict layered architecture:

Request -> Route (HTTP) -> Service (Logic) -> Model (DB)

Routes are intentionally thin. All business rules,
validation logic, and data processing live in services.

---

## Role-Based Access Control

RBAC is implemented as a reusable FastAPI dependency factory
in app/middleware/rbac.py:
```python
def require_roles(*roles: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return current_user
    return role_checker

require_admin           = require_roles(UserRole.admin)
require_analyst_or_above = require_roles(UserRole.admin, UserRole.analyst)
require_any_role        = require_roles(UserRole.admin, UserRole.analyst, UserRole.viewer)
```

Every route declares its access level explicitly:

| Endpoint | Viewer | Analyst | Admin |
|----------|--------|---------|-------|
| GET /dashboard/summary | Yes | Yes | Yes |
| GET /records/ | No | Yes | Yes |
| POST /records/ | No | No | Yes |
| PATCH /records/{id} | No | No | Yes |
| DELETE /records/{id} | No | No | Yes |
| GET /users/ | No | No | Yes |
| POST /users/ | No | No | Yes |
| PATCH /users/{id}/activate | No | No | Yes |
| DELETE /users/{id} | No | No | Yes |

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/login
```
### Users (Admin only)
```
GET    /api/v1/users/
POST   /api/v1/users/
GET    /api/v1/users/{id}
PATCH  /api/v1/users/{id}
PATCH  /api/v1/users/{id}/activate
PATCH  /api/v1/users/{id}/deactivate
DELETE /api/v1/users/{id}
```
### Financial Records
```
GET    /api/v1/records/         Analyst + Admin
POST   /api/v1/records/         Admin only
GET    /api/v1/records/{id}     Analyst + Admin
PATCH  /api/v1/records/{id}     Admin only
DELETE /api/v1/records/{id}     Admin only (soft delete)
```
### Query params for GET /records/:
```
?type=income|expense
?category=salary|food|rent|...
?date_from=2024-01-01
?date_to=2024-12-31
?search=description text
?page=1&page_size=20
```
### Dashboard
```
GET    /api/v1/dashboard/summary   All roles
```
Returns:
- Total income, total expenses, net balance
- Category-wise totals (DB aggregation)
- Monthly income vs expense trends (DB aggregation)

Full interactive documentation at /docs (Swagger UI).

---
## Database Schema
```
  users
    id               UUID PRIMARY KEY
    full_name        VARCHAR(100)
    email            VARCHAR(255) UNIQUE
    hashed_password  VARCHAR(255)
    role             ENUM(admin, analyst, viewer)
    is_active        BOOLEAN DEFAULT true
    created_at       TIMESTAMPTZ
    updated_at       TIMESTAMPTZ
```
```
  financial_records
    id               UUID PRIMARY KEY
    amount           NUMERIC(15,2)
    type             ENUM(income, expense)
    category         ENUM(salary, food, rent, ...)
    date             DATE
    description      TEXT nullable
    is_deleted       BOOLEAN DEFAULT false
    user_id          UUID FOREIGN KEY -> users.id
    created_at       TIMESTAMPTZ
    updated_at       TIMESTAMPTZ
```
---
## Local Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 16
- Node.js 18+

### 1. Clone and create virtual environment
```
  git clone https://github.com/Kumudadp/finance-dashboard.git
  cd finance-dashboard
  python -m venv venv
  venv\Scripts\activate        # Windows
  source venv/bin/activate     # Mac/Linux
```
### 2. Install dependencies
```
  pip install -r requirements.txt
```
### 3. PostgreSQL setup
```
  psql -U postgres
  CREATE DATABASE finance_dashboard;
  CREATE USER finance_user WITH PASSWORD 'securepassword123';
  GRANT ALL PRIVILEGES ON DATABASE finance_dashboard TO finance_user;
  GRANT ALL ON SCHEMA public TO finance_user;
  \q
```
### 4. Configure environment

  Copy .env.example to .env and update if needed.

### 5. Run migrations
```
  alembic upgrade head
```
### 6. Seed demo users
```
  python seed.py
```
### 7. Start backend
```
  uvicorn app.main:app --reload
```
```
  API: http://localhost:8000
  Swagger docs: http://localhost:8000/docs
```
### 8. Start frontend
```
  cd frontend
  npm install
  npm run dev
```
```
  Frontend: http://localhost:5173
```
---

## Key Design Decisions

### UUID Primary Keys

Integer IDs expose record counts and are guessable.

UUIDs are non-sequential and safer for financial data.

### Numeric(15,2) for Money

Float has rounding errors in binary representation.

Financial amounts always use Decimal/Numeric to avoid precision loss.

This is standard in fintech systems.

### Soft Delete Pattern

Financial records are never hard deleted.

The is_deleted flag preserves full audit history.

This mirrors real-world compliance requirements where transaction records must be retained.

### DB-Level Aggregation

Dashboard totals and trends are calculated using SQLAlchemy aggregation (func.sum, func.group_by, case()) directly in PostgreSQL — not in Python.

This is efficient regardless of record volume.

### Alembic Migrations

Every schema change is version-controlled and reproducible.

Mirrors production database management practices.

### Rate Limiting

Login endpoint is rate-limited to 10 requests/minute using slowapi to prevent brute-force attacks.

### Request Logging

Every HTTP request is logged with method, path, status code, and response time in milliseconds.

---

## Optional Enhancements Implemented

- JWT authentication with 24hr expiry
- Pagination (page + page_size)
- Search on description field
- Soft delete with audit trail
- Activate/deactivate users without data loss
- Swagger + ReDoc auto-generated docs
- Role-aware frontend navigation
- Pydantic v2 input validation
- Rate limiting on auth endpoint
- Request/response logging
- DB indexes on frequently queried columns
- Connection pooling configuration

---

## Assumptions Made

1. A seed script creates demo users for admin role.
2. Soft delete is used for records to preserve audit history.
3. Deactivated users cannot log in but their data is preserved.
4. All monetary amounts are in INR.
5. JWT tokens expire after 24 hours (configurable via .env).
6. The free tier on Render spins down after inactivity — first request may take 30-50 seconds to wake up.

---

## Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| PostgreSQL | Production ready | Requires setup |
| Soft delete | Audit compliance | Extra filter on every query |
| JWT over sessions | Stateless, scalable | Cannot invalidate before expiry |
| Pydantic v2 | Strict validation | Stricter than v1 |
| UUID over integer IDs | Non-guessable | Larger storage size |
| DB aggregation | Efficient at scale | More complex queries |
