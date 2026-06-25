from typing import Optional

from db.connection import get_connection


def create_log(
    action: str,
    status: str,
    user_email: str | None = None,
    details: str | None = None,
) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO admin_logs (user_email, action, status, details)
            OUTPUT INSERTED.id, INSERTED.user_email, INSERTED.action, INSERTED.status, INSERTED.details, INSERTED.created_at
            VALUES (?, ?, ?, ?)
            """,
            (user_email, action, status, details),
        )
        row = cursor.fetchone()
        conn.commit()

        return {
            "id": str(row.id),
            "user_email": row.user_email,
            "action": row.action,
            "status": row.status,
            "details": row.details,
            "created_at": str(row.created_at) if row.created_at else None,
        }
    finally:
        conn.close()


def list_logs(limit: int = 100) -> list[dict]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            f"""
            SELECT TOP ({limit}) id, user_email, action, status, details, created_at
            FROM admin_logs
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()

        return [
            {
                "id": str(row.id),
                "user_email": row.user_email,
                "action": row.action,
                "status": row.status,
                "details": row.details,
                "created_at": str(row.created_at) if row.created_at else None,
            }
            for row in rows
        ]
    finally:
        conn.close()