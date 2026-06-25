from fastapi import HTTPException, status

from auth.security import hash_password, verify_password, create_access_token
from db.users_repository import get_user_by_email, get_user_by_id, create_user
from db.logs_repository import create_log

def register_user(
    email: str,
    password: str,
    role: str = "employee",
    first_name: str | None = None,
    last_name: str | None = None,
    avatar_url: str | None = None,
) -> dict:
    email = email.strip().lower()

    existing_user = get_user_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists."
        )

    password_hash = hash_password(password)

    user = create_user(
        email=email,
        password_hash=password_hash,
        role=role,
        first_name=first_name,
        last_name=last_name,
        avatar_url=avatar_url,
    )

    create_log(
        user_email=email,
        action="register",
        status="success",
        details=f"User registered with role {role}",
    )
    return user


def login_user(email: str, password: str) -> dict:
    email = email.strip().lower()

    user = get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )

    access_token = create_access_token(
        {
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"],
        }
    )
    create_log(
        user_email=user["email"],
        action="login",
        status="success",
        details=f"User logged in with role {user['role']}",
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "avatar_url": user.get("avatar_url"),
            "created_at": user["created_at"],
        },
    }


def get_current_user_from_token(token: str) -> dict:
    from auth.security import decode_access_token

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload."
        )

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "avatar_url": user.get("avatar_url"),
        "created_at": user["created_at"],
    }