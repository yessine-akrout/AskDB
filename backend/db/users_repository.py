from typing import Optional

from db.connection import get_connection


def get_user_by_email(email: str) -> Optional[dict]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, email, password_hash, role, first_name, last_name, avatar_url, created_at
            FROM users
            WHERE email = ?
            """,
            (email,)
        )
        row = cursor.fetchone()

        if not row:
            return None

        return {
            "id": str(row.id),
            "email": row.email,
            "password_hash": row.password_hash,
            "role": row.role,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "avatar_url": row.avatar_url,
            "created_at": str(row.created_at) if row.created_at else None,
        }
    finally:
        conn.close()


def get_user_by_id(user_id: str) -> Optional[dict]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, email, password_hash, role, first_name, last_name, avatar_url, created_at
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        )
        row = cursor.fetchone()

        if not row:
            return None

        return {
            "id": str(row.id),
            "email": row.email,
            "password_hash": row.password_hash,
            "role": row.role,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "avatar_url": row.avatar_url,
            "created_at": str(row.created_at) if row.created_at else None,
        }
    finally:
        conn.close()


def create_user(
    email: str,
    password_hash: str,
    role: str = "employee",
    first_name: str | None = None,
    last_name: str | None = None,
    avatar_url: str | None = None,
) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, role, first_name, last_name, avatar_url)
            OUTPUT INSERTED.id, INSERTED.email, INSERTED.role, INSERTED.first_name, INSERTED.last_name, INSERTED.avatar_url, INSERTED.created_at
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (email, password_hash, role, first_name, last_name, avatar_url)
        )
        row = cursor.fetchone()
        conn.commit()

        return {
            "id": str(row.id),
            "email": row.email,
            "role": row.role,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "avatar_url": row.avatar_url,
            "created_at": str(row.created_at) if row.created_at else None,
        }
    finally:
        conn.close()

def get_all_users() -> list[dict]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, email, role, first_name, last_name, avatar_url, created_at
            FROM users
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()

        return [
            {
                "id": str(row.id),
                "email": row.email,
                "role": row.role,
                "first_name": row.first_name,
                "last_name": row.last_name,
                "avatar_url": row.avatar_url,
                "created_at": str(row.created_at) if row.created_at else None,
            }
            for row in rows
        ]
    finally:
        conn.close()


def delete_user_by_id(user_id: str) -> bool:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM users
            WHERE id = ?
            """,
            (user_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def get_all_users() -> list[dict]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, email, role, first_name, last_name, avatar_url, created_at
            FROM users
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()

        return [
            {
                "id": str(row.id),
                "email": row.email,
                "role": row.role,
                "first_name": row.first_name,
                "last_name": row.last_name,
                "avatar_url": row.avatar_url,
                "created_at": str(row.created_at) if row.created_at else None,
            }
            for row in rows
        ]
    finally:
        conn.close()


def delete_user_by_id(user_id: str) -> bool:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM users
            WHERE id = ?
            """,
            (user_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()