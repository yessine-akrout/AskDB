# AI Engine

The core Text-to-SQL service. Accepts natural language questions and returns executable SQL + results.

## Architecture

```
Question
   │
   ▼
Normalizer          (normalize_question)
   │
   ▼
RBAC Check 1        (validate_user_question_access)
   │
   ▼
ChromaDB Retrieval  (chroma_retreiever_northwind.py)
   │                 Semantic search over Northwind schema embeddings
   ▼
Prompt Builder      (rag_prompt_builder.py)
   │                 Schema context + few-shot examples + user question
   ▼
LM Studio LLM       (client.py → localhost:1234)
   │                 qwen2.5-coder-7b-instruct
   ▼
SQL Extraction      (extract_and_clean_sql)
   │
   ▼
SQL Validation      (validate_select_query) — blocks DROP/DELETE/UPDATE etc.
   │
   ▼
RBAC Check 2        (validate_sql_table_access) — check table permissions
   │
   ▼
SQL Execution       (executor.py → NORTHWIND_DB)
   │
   ▼
Query Log           (query_logs_repository.py → TextToSQL_App.query_logs)
   │
   ▼
Response JSON
```

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install chromadb sentence-transformers fastapi uvicorn

copy .env.example .env
# Edit .env with your SQL Server name

# Start LM Studio on port 1234 first, then:
uvicorn myapi:app --host 127.0.0.1 --port 5000 --reload
```

## Dependencies

See `requirements.txt`. Additional packages needed:
- `chromadb` — vector store
- `sentence-transformers` — for embedding model (all-MiniLM-L6-v2)
- `fastapi` + `uvicorn` — API server
- `openai` or direct `requests` — LM Studio client

## Key Files

| File | Purpose |
|------|---------|
| `myapi.py` | FastAPI entry point, `/chat` endpoint |
| `src/pipeline/rag_pipeline.py` | Main orchestrator |
| `src/RAG/chroma_solution/chroma_retreiever_northwind.py` | ChromaDB schema retrieval |
| `src/prompt/rag_prompt_builder.py` | Prompt construction |
| `src/LLM/client.py` | LM Studio API client |
| `src/security/rbac.py` | Role-based access control |
| `src/sql/executor.py` | SQL execution against NORTHWIND_DB |
| `src/sql/query_logs_repository.py` | Log writes to TextToSQL_App |
| `vector_store/chroma_schema_db/` | Pre-built Northwind schema embeddings |

## API

### `POST /chat`
```json
{
  "question": "top 5 customers by revenue",
  "user_email": "user@example.com",
  "user_role": "directeur"
}
```

Returns:
```json
{
  "question": "top 5 customers by revenue",
  "sql": "SELECT TOP 5 c.CustomerID, c.CompanyName, SUM(...) AS TotalSales ...",
  "result": {
    "columns": ["CustomerID", "CompanyName", "TotalSales"],
    "rows": [...],
    "row_count": 5
  },
  "status": "success"
}
```

