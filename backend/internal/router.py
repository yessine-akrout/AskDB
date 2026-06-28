from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db.query_logs_repository import create_query_log

router = APIRouter()

class QueryLogRequest(BaseModel):
    user_email: Optional[str] = None
    question: str
    generated_sql: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    row_count: Optional[int] = None
    result_json: Optional[str] = None

@router.post("/query-logs")
def add_query_log(payload: QueryLogRequest):
    try:
        log = create_query_log(
            user_email=payload.user_email,
            question=payload.question,
            generated_sql=payload.generated_sql,
            status=payload.status,
            error_message=payload.error_message,
            row_count=payload.row_count,
            result_json=payload.result_json,
        )
        return {"message": "Log created successfully", "log": log}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
