# Finance Dashboard API

A role-based finance dashboard system built with FastAPI, PostgreSQL, and React.

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

---

## Project Structure
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

## Setup Instructions

### Prerequisites
- Python 3.11+
- PostgreSQL 16
- Node.js 18+

### 1. Clone and create virtual environment
```bash
  git clone https://github.com/Kumudadp/finance-dashboard.git
  cd finance-dashboard
  python -m venv venv
  venv\Scripts\activate
```
### 2. Install dependencies
```bash
  pip install -r requirements.txt
```
### 3. PostgreSQL setup
```bash
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
```bash
  alembic upgrade head
```
### 6. Seed demo users
```bash
  python seed.py
```
### 7. Start backend
```bash
  uvicorn app.main:app --reload
```
```
  API: http://localhost:8000
  Swagger docs: http://localhost:8000/docs
```
### 8. Start frontend
```bash
  cd frontend
  npm install
  npm run dev
```
```
  Frontend: http://localhost:5173
```
---

## Demo Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@finance.com      | Admin1234  |
| Analyst | analyst@finance.com    | Analyst123 |
| Viewer  | viewer@finance.com     | Viewer1234 |

---

## Role-Based Access Control

| Feature                | Viewer | Analyst | Admin |
|------------------------|--------|---------|-------|
| View dashboard summary | Yes    | Yes     | Yes   |
| View records           | No     | Yes     | Yes   |
| Create records         | No     | No      | Yes   |
| Update records         | No     | No      | Yes   |
| Delete records         | No     | No      | Yes   |
| Manage users           | No     | No      | Yes   |

RBAC is implemented as a reusable FastAPI dependency factory
in app/middleware/rbac.py. Every route declares its required
role using Depends(require_admin) or Depends(require_analyst_or_above).

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
  GET    /api/v1/records/            Analyst + Admin
  POST   /api/v1/records/            Admin only
  GET    /api/v1/records/{id}        Analyst + Admin
  PATCH  /api/v1/records/{id}        Admin only
  DELETE /api/v1/records/{id}        Admin only (soft delete)
```
### Dashboard
```
  GET    /api/v1/dashboard/summary   All roles
```
Full interactive docs available at /docs (Swagger UI).

---

## Key Design Decisions

### UUID Primary Keys

Integer IDs expose record counts and are guessable.

UUIDs are non-sequential and safer for financial data.

### Numeric(15,2) for Money

Float has rounding errors in binary representation.

Financial amounts always use Decimal/Numeric to avoid
precision loss.
This is standard in fintech systems.

### Soft Delete Pattern

Financial records are never hard deleted.

The is_deleted flag preserves full audit history.

This mirrors real-world compliance requirements where
transaction records must be retained.

### Separation of Concerns

Routes handle HTTP only - request in, response out.

All business rules live in the services layer.

This makes logic independently testable.

### Alembic Migrations

Every schema change is versioned and reproducible.

Mirrors how production database changes are managed.

### Connection Pooling

pool_pre_ping=True detects dropped DB connections.

pool_size and max_overflow handle concurrent requests.

---

## Optional Enhancements Implemented

- JWT authentication with configurable expiry
- Pagination for record listing (page + page_size params)
- Search support on description field
- Soft delete for financial records
- Activate/deactivate users without data loss
- Auto-generated Swagger and ReDoc API documentation
- Role-aware frontend (navigation changes per role)
- Input validation via Pydantic v2 with clear error messages
- Alembic database migrations
- CORS middleware configured

---

## Assumptions Made

1. A seed script creates demo users for all three roles.
2. Soft delete is used for records to preserve audit history.
3. Deactivated users cannot log in but their data is preserved.
4. All monetary amounts are in INR.
5. JWT tokens expire after 24 hours (configurable via .env).
6. The frontend is a companion UI, not part of the core backend evaluation.

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

## Tradeoffs
```
- SQLite was replaced with PostgreSQL for production readiness.
- Pydantic v2 is stricter than v1 but gives better validation errors.
- Soft delete adds a filter to every query but preserves data integrity.
- JWT is stateless (no server-side session) which is simpler to scale.
```
