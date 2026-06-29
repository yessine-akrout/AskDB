# AskDB — Natural Language to SQL AI System

**AskDB** is a full-stack Text-to-SQL application that allows users to query a **Microsoft SQL Server database using plain English**. It uses a RAG (Retrieval-Augmented Generation) pipeline powered by ChromaDB and a local LLM (via LM Studio) to convert natural language questions into executable SQL queries — with built-in RBAC access control, query logging, and an admin dashboard.

---

## Table of Contents

- [🚀 See It In Action](#-see-it-in-action)
- [Architecture](#architecture)
- [Features](#features)
- [Test Accounts](#test-accounts)
- [Sample Questions to Try](#sample-questions-to-try)
- [Tech Stack & Prerequisites](#tech-stack--prerequisites)
- [Customizing for Your Own Database](#customizing-for-your-own-database)
- [Project Structure](#project-structure)
- [Setup & Running](#setup--running)
- [Key API Endpoints](#key-api-endpoints)
- [How It Works](#how-it-works)
- [RBAC Roles](#rbac-roles)
- [ChromaDB Vector Store](#chromadb-vector-store)
- [License](#license)

---

## 🚀 See It In Action

Experience AskDB in two different ways:

- **[🌐 Try the Interactive Live Demo](https://ask-db2.vercel.app/auth/sign-in)** — Test the web app yourself directly in your browser.
- **[🎬 Watch the Video Walkthrough](https://drive.google.com/file/d/1aEAhfrb-sVd5sPC6992h-of1GpisidWG/view?usp=sharing)** — A full recorded tour of the UI, RBAC features, and querying capabilities.

> **Database used in these demos:** Microsoft Northwind (sample trading company database)

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
│   FastAPI :5000        │        │   FastAPI :5001              │
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
- 📱 **Fully Responsive UI** — works flawlessly on mobile, tablet, and desktop
- ⚡ **ChromaDB Vector DB** — pre-built schema embeddings for blazing fast semantic retrieval

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

## Tech Stack & Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | AI engine & backend (FastAPI, sentence-transformers, ChromaDB) |
| Node.js | 18+ | Frontend & admin panel (Next.js, TypeScript) |
| SQL Server Express | 2019+ | Databases |
| LM Studio | Latest | Local LLM runner (qwen2.5-coder-7b-instruct) |
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

## Customizing for Your Own Database

If you decide to use AskDB with a different database instead of Northwind, you will need to customize the following files to match your new schema:

1. **RBAC Rules**: `ai_engine/src/security/rbac.py`
   - Update the table names and user roles to match your business requirements.
2. **Prompts & Few-Shot Examples**: `ai_engine/src/prompt/rag_prompt_builder.py`
   - Customize the instructions and provide new few-shot SQL examples relevant to your new database.
3. **Table Keywords**: `ai_engine/src/RAG/northwind_table_keywords.py`
   - Create a new file (e.g., `yourdb_table_keywords.py`) mapping your tables to relevant search keywords. Update the imports to use this new file.
4. **Semantic Knowledge Base**: `ai_engine/src/RAG/semantic_kb.py`
   - Define custom terminology, domain-specific slang, and mapping rules for your specific data.
5. **Rebuild ChromaDB**: `ai_engine/src/RAG/chroma_solution/`
   - You must re-run your schema extraction and embedding scripts to generate a new Vector DB based on your new database.

---

## Project Structure

```
AskDB/
├── ai_engine/          # RAG + LLM pipeline (FastAPI :5000)
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
uvicorn myapi:app --host 127.0.0.1 --port 5000 --reload
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

## Key API Endpoints

### AI Engine (`localhost:5000`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Submit a natural language question → get SQL + results |

### Backend (`localhost:5001`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/admin/users` | List all users (admin only) |
| `DELETE` | `/admin/users/{id}` | Delete a user (admin only) |
| `GET` | `/admin/logs` | View admin audit logs |
| `GET` | `/admin/query-logs` | View AI query logs (fetched from DB) |

---

## How It Works

1. **User asks a question** in the frontend chat UI.
2. **AI Engine processes the query** by validating RBAC permissions, fetching relevant schema context from ChromaDB, and sending a tailored prompt to the local LLM.
3. **Execution & Results**: The validated SQL is executed against the database, the action is logged, and results are returned to the user.

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

## License

MIT
