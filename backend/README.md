# Backend

Authentication and admin management API for AskDB.

## Responsibilities

- **User registration and login** (JWT-based)
- **User management** (admin: list, delete users)
- **Audit logging** (`admin_logs` table)
- **Proxy** to AI engine query logs for the admin panel

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

copy .env.example .env
# Edit .env: set DB_SERVER and a strong JWT_SECRET

uvicorn main:app --host 127.0.0.1 --port 5001 --reload
```

## Database

Connects to **`TextToSQL_App`** on SQL Server.  
Run [`../database/setup_TextToSQL_App.sql`](../database/setup_TextToSQL_App.sql) first.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | None | Register new user |
| `POST` | `/auth/login` | None | Login → JWT token |
| `GET` | `/auth/me` | Bearer JWT | Get current user info |
| `GET` | `/admin/users` | Admin JWT | List all users |
| `DELETE` | `/admin/users/{id}` | Admin JWT | Delete a user |
| `GET` | `/admin/logs` | Admin JWT | View admin audit logs |
| `GET` | `/admin/query-logs` | Admin JWT | View AI query logs (proxied from :8000) |

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full admin panel access |
| `directeur` | Can query all Northwind tables |
| `stagiaire` | Limited table access (no financial data) |

## Key Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app + CORS setup |
| `auth/router.py` | Auth endpoints |
| `auth/service.py` | Business logic |
| `auth/security.py` | JWT + bcrypt helpers |
| `admin/router.py` | Admin-only endpoints |
| `db/connection.py` | SQL Server connection |
| `db/users_repository.py` | User CRUD operations |
| `db/logs_repository.py` | Admin log operations |
