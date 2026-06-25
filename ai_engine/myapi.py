import sys
import os

# Fix Windows console encoding for French characters under uvicorn
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

os.environ.setdefault("PYTHONIOENCODING", "utf-8")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

from src.pipeline.rag_pipeline import run_text_to_sql
from src.sql.query_logs_repository import create_query_log, list_query_logs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str
    user_email: str | None = None
    user_role: str | None = "stagiaire"


@app.post("/chat")
def questionnaire(payload: Question):
    dangerous_words = ["drop", "delete", "update", "insert", "alter", "truncate"]
    normalized_question = payload.question.strip()

    user_role = payload.user_role or "stagiaire"
    user_role = user_role.lower().strip()

    allowed_roles = ["stagiaire", "directeur", "admin"]

    if user_role not in allowed_roles:
        create_query_log(
            user_email=payload.user_email,
            question=normalized_question,
            generated_sql=None,
            status="access_denied",
            error_message=f"Invalid user role: {user_role}",
            row_count=None,
            result_json=None,
        )

        raise HTTPException(
            status_code=403,
            detail="Rôle utilisateur non autorisé."
        )

    if any(word in normalized_question.lower() for word in dangerous_words):
        create_query_log(
            user_email=payload.user_email,
            question=normalized_question,
            generated_sql=None,
            status="validation_failed",
            error_message="Dangerous query blocked before execution.",
            row_count=None,
            result_json=None,
        )

        raise HTTPException(
            status_code=403,
            detail="Requête dangereuse"
        )

    try:
        result = run_text_to_sql(
            question=normalized_question,
            user_role=user_role
        )

        generated_sql = result.get("sql")
        status = result.get("status", "unknown")
        row_count = None
        error_message = None
        result_json = None

        if isinstance(result.get("result"), dict):
            row_count = result["result"].get("row_count")

            safe_result = {
                "columns": result["result"].get("columns", []),
                "rows": result["result"].get("rows", []),
                "row_count": result["result"].get("row_count"),
            }

            result_json = json.dumps(
                safe_result,
                ensure_ascii=False,
                default=str
            )

        if status != "success":
            error_message = (
                result.get("error")
                or result.get("message")
                or "Query failed."
            )

        create_query_log(
            user_email=payload.user_email,
            question=normalized_question,
            generated_sql=generated_sql,
            status=status,
            error_message=error_message,
            row_count=row_count,
            result_json=result_json,
        )

        return result

    except Exception as e:
        create_query_log(
            user_email=payload.user_email,
            question=normalized_question,
            generated_sql=None,
            status="execution_failed",
            error_message=str(e),
            row_count=None,
            result_json=None,
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/query-logs")
def get_query_logs():
    return {
        "logs": list_query_logs(limit=200)
    }