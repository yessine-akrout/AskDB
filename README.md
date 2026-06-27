# AskDB — Natural Language to SQL AI System

**AskDB** is a full-stack Text-to-SQL application that allows users to query a **Microsoft SQL Server database using plain English**. It uses a RAG (Retrieval-Augmented Generation) pipeline powered by ChromaDB and a local LLM (via LM Studio) to convert natural language questions into executable SQL queries — with built-in RBAC access control, query logging, and an admin dashboard.

> **Live Demo:** [http://bit.ly/4ezbt6b](http://bit.ly/4ezbt6b)  
> **Database used in this demo:** Microsoft Northwind (sample trading company database)

---

## Video Demo

*(Video demo coming soon - will be added here)*

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                                                                  │
│   ┌─────────────────────┐      ┌─────────────────────────────┐  │
│   │   Frontend          │      │   Admin Panel               │  │
│   │   (Next.js :3000)   │      │   (Next.js :3001)           │  │
│   │   Chat UI           │      │   User/Log management       │  │
│   └────────┬────────────┘      └──────────────┬──────────────┘  │
│            │                                  │                  │
└────────────┼──────────────────────────────────┼──────────────────┘
             │                                  │
             ▼                                  ▼
┌────────────────────────┐        ┌──────────────────────────────┐
│   AI Engine            │        │   Backend                    │
│   FastAPI :8000        │        │   FastAPI :5001              │
│                        │        │                              │
│  ┌──────────────────┐  │        │  - Auth (JWT)                │
│  │  RAG Pipeline    │  │        │  - User management           │
│  │  ChromaDB        │  │        │  - Admin logs                │
│  │  LM Studio LLM   │  │        │                              │
│  │  RBAC checks     │  │        └──────────────┬───────────────┘
│  └────────┬─────────┘  │                       │
│           │             │                       │
└───────────┼─────────────┘                       │
            │                                     │
            ▼                                     ▼
┌────────────────────────────────────────────────────────────────┐
│                    SQL Server (SQLEXPRESS)                      │
│                                                                │
│   ┌────────────────┐   ┌─────────────────────────────────┐    │
│   │  NORTHWIND_DB  │   │  TextToSQL_App DB               │    │
│   │  (business DB) │   │  - users                        │    │
│   │  - query_logs  │   │  - admin_logs                   │    │
│   └────────────────┘   └─────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────┐
│  LM Studio          │
│  localhost:1234     │
│  qwen2.5-coder-7b   │
└─────────────────────┘
```

---

## Features

- 🧠 **Natural Language → SQL** via RAG + local LLM (no API keys needed)
- 🔒 **RBAC** — role-based access control (`admin`, `directeur`, `stagiaire`)
- 🛡️ **SQL injection protection** — dangerous keywords blocked before execution
- 📊 **Query logging** — every question and generated SQL is tracked
- 👤 **User authentication** — JWT-based login/register
- 🖥️ **Admin panel** — manage users, view audit logs and query history
- ⚡ **ChromaDB** — pre-built schema embeddings for fast schema retrieval

---

## Test Accounts

You can use the following accounts to test the application (all passwords are `1234`):

| Name | Role | Email |
|------|------|-------|
| Messi | `admin` | `messi@gmail.com` |
| Yessine | `directeur` | `yessine.akrout123@gmail.com` |
| Fedi | `stagiaire` | `fedi.turki@gmail.com` |

---

## Sample Questions to Try

Once everything is running, try asking the AI these questions (which are specifically meant for the Northwind database):

- **"Show all orders"** *(Simple query)*
- **"List all employees located in London"** *(Filtering)*
- **"How many products are in each category?"** *(Aggregation)*
- **"Show total sales by category"** *(Complex JOINs with calculations)*
- **"Who are the top 5 customers by revenue?"** *(Sorting and Limiting)*

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | AI engine & backend |
| Node.js | 18+ | Frontend & admin panel |
| SQL Server Express | 2019+ | Databases |
| LM Studio | Latest | Local LLM runner |
| SSMS (optional) | Any | DB management |

### Required SQL Server Databases
The application requires two SQL Server databases (setup instructions are in Step 1 below):

1. **`NORTHWIND_DB`** — the business database being queried, and stores the `query_logs` table.
2. **`TextToSQL_App`** — stores users and auth logs.

### Required LM Studio Setup
1. Download [LM Studio](https://lmstudio.ai/)
2. Download the model: `qwen2.5-coder-7b-instruct`
3. Start the **Local Server** in LM Studio

---

## Project Structure

```
AskDB/
├── ai_engine/          # RAG + LLM pipeline (FastAPI :8000)
├── backend/            # Auth & admin API (FastAPI :5001)
├── frontend/           # User chat UI (Next.js :3000)
├── admin-panel/        # Admin dashboard UI (Next.js :3001)
└── database/           # SQL setup scripts & documentation
```

---

## Setup & Running

### Step 1 — Set Up Databases

*(Note: These scripts use T-SQL and must be executed in Microsoft SQL Server, for example using SQL Server Management Studio or sqlcmd).*

```bash
# Create TextToSQL_App database
sqlcmd -S YOUR_SERVER\SQLEXPRESS -E -i database/setup_TextToSQL_App.sql

# Create NORTHWIND_DB database (with sample data and query_logs)
sqlcmd -S YOUR_SERVER\SQLEXPRESS -E -i database/setup_NORTHWIND_DB.sql
```

### Step 2 — AI Engine

```bash
cd ai_engine

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install chromadb sentence-transformers fastapi uvicorn

# Configure environment
copy .env.example .env
# Edit .env with your SQL Server name

# Start the server
uvicorn myapi:app --host 127.0.0.1 --port 8000 --reload
```

> ⚠️ **Make sure LM Studio is running before starting the AI engine!**

### Step 3 — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your SQL Server name and a strong JWT_SECRET

# Start the server
uvicorn main:app --host 127.0.0.1 --port 5001 --reload
```

### Step 4 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.local.example .env.local

# Start dev server
npm run dev
# Next.js will auto-assign a port (usually 3000 or 3001)
```

### Step 5 — Admin Panel

```bash
cd admin-panel

# Install dependencies
npm install

# Configure environment
copy .env.local.example .env.local

# Start dev server
npm run dev
# Next.js will auto-assign a port (usually 3000 or 3001)
```

---

## Port Summary

| Service | Port | URL |
|---------|------|-----|
| AI Engine (FastAPI) | 5000 | http://localhost:5000 |
| Backend (FastAPI) | 5001 | http://localhost:5001 |
| Frontend (Next.js) | Auto | http://localhost:3000 (default) |
| Admin Panel (Next.js) | Auto | http://localhost:3001 (default) |
| LM Studio | 1234 | http://localhost:1234 |

---

## Key API Endpoints

### AI Engine (`localhost:5000`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Submit a natural language question → get SQL + results |
| `GET` | `/query-logs` | List all query execution logs |

### Backend (`localhost:5001`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/admin/users` | List all users (admin only) |
| `DELETE` | `/admin/users/{id}` | Delete a user (admin only) |
| `GET` | `/admin/logs` | View admin audit logs |
| `GET` | `/admin/query-logs` | View AI query logs (proxied) |

---

## How It Works

1. User types a question in the chat UI (e.g., *"top 5 customers by revenue"*)
2. The frontend sends the question to the **AI engine**
3. The AI engine:
   - Checks RBAC permissions based on user role
   - Retrieves relevant database schema chunks from **ChromaDB** (vector similarity search)
   - Builds a prompt with schema context + few-shot examples
   - Sends the prompt to the **local LLM** (via LM Studio)
   - Validates the generated SQL (no dangerous commands)
   - Executes the SQL against **NORTHWIND_DB**
   - Logs everything to **TextToSQL_App.query_logs**
4. Results are returned to the frontend and displayed

---

## RBAC Roles

| Role | Access Level |
|------|-------------|
| `admin` | Full access — all tables, all queries |
| `directeur` | Full database access |
| `stagiaire` | Limited — only operational/reference tables, no financial data |

---

## ChromaDB Vector Store

The `ai_engine/vector_store/chroma_schema_db/` directory contains **pre-built embeddings** of the Northwind database schema. These are committed to the repo so you don't need to rebuild them.

The embeddings were generated using the `all-MiniLM-L6-v2` sentence-transformers model.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Pipeline | Python, FastAPI, ChromaDB, sentence-transformers |
| LLM | qwen2.5-coder-7b-instruct (via LM Studio) |
| Auth Backend | Python, FastAPI, JWT (python-jose), bcrypt |
| Frontend | Next.js, TypeScript |
| Admin Panel | Next.js, TypeScript |
| Databases | Microsoft SQL Server, ChromaDB |
| SQL Driver | pyodbc (Windows Auth) |

---

## License

MIT
