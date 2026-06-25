from src.sql.db import get_connection


def create_query_log(
    question: str,
    status: str,
    user_email: str | None = None,
    generated_sql: str | None = None,
    error_message: str | None = None,
    row_count: int | None = None,
    result_json: str | None = None,
) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO query_logs (
                user_email,
                question,
                generated_sql,
                status,
                error_message,
                row_count,
                result_json
            )
            OUTPUT INSERTED.id,
                   INSERTED.user_email,
                   INSERTED.question,
                   INSERTED.generated_sql,
                   INSERTED.status,
                   INSERTED.error_message,
                   INSERTED.row_count,
                   INSERTED.result_json,
                   INSERTED.created_at
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_email,
                question,
                generated_sql,
                status,
                error_message,
                row_count,
                result_json,
            ),
        )
        row = cursor.fetchone()
        conn.commit()

        return {
            "id": str(row.id),
            "user_email": row.user_email,
            "question": row.question,
            "generated_sql": row.generated_sql,
            "status": row.status,
            "error_message": row.error_message,
            "row_count": row.row_count,
            "result_json": row.result_json,
            "created_at": str(row.created_at) if row.created_at else None,
        }
    finally:
        conn.close()


def list_query_logs(limit: int = 200) -> list[dict]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            f"""
            SELECT TOP ({limit})
                id,
                user_email,
                question,
                generated_sql,
                status,
                error_message,
                row_count,
                result_json,
                created_at
            FROM query_logs
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()

        return [
            {
                "id": str(row.id),
                "user_email": row.user_email,
                "question": row.question,
                "generated_sql": row.generated_sql,
                "status": row.status,
                "error_message": row.error_message,
                "row_count": row.row_count,
                "result_json": row.result_json,
                "created_at": str(row.created_at) if row.created_at else None,
            }
            for row in rows
        ]
    finally:
        conn.close()