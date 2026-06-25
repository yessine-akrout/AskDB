import requests
from fastapi import APIRouter, Depends, HTTPException, status

from core.dependencies import get_current_user
from db.users_repository import get_all_users, delete_user_by_id
from db.logs_repository import list_logs, create_log

router = APIRouter()

TEXT2SQL_API_URL = "http://127.0.0.1:5000"


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


@router.get("/users")
def list_users(current_user: dict = Depends(require_admin)):
    users = get_all_users()
    return {"users": users}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    deleted = delete_user_by_id(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    create_log(
        user_email=current_user.get("email"),
        action="delete_user",
        status="success",
        details=f"Deleted user with id {user_id}",
    )

    return {"message": "User deleted successfully."}


@router.get("/logs")
def get_logs(current_user: dict = Depends(require_admin)):
    logs = list_logs(limit=200)
    return {"logs": logs}


@router.get("/query-logs")
def get_query_logs(current_user: dict = Depends(require_admin)):
    try:
        response = requests.get(f"{TEXT2SQL_API_URL}/query-logs", timeout=10)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=data.get("detail", "Failed to fetch query logs from Text2SQL service."),
            )

        return {"logs": data.get("logs", [])}

    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not connect to Text2SQL service.",
        )