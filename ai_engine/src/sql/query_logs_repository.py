import os
import requests

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://127.0.0.1:5001")

def create_query_log(
    question: str,
    status: str,
    user_email: str | None = None,
    generated_sql: str | None = None,
    error_message: str | None = None,
    row_count: int | None = None,
    result_json: str | None = None,
) -> dict:
    payload = {
        "user_email": user_email,
        "question": question,
        "generated_sql": generated_sql,
        "status": status,
        "error_message": error_message,
        "row_count": row_count,
        "result_json": result_json
    }
    
    try:
        response = requests.post(f"{BACKEND_API_URL}/internal/query-logs", json=payload, timeout=5)
        response.raise_for_status()
        return response.json().get("log", {})
    except Exception as e:
        print(f"Warning: Failed to write query log to backend: {e}")
        return {}