from fastapi import APIRouter, Depends

from auth.schemas import RegisterRequest, LoginRequest
from auth.service import register_user, login_user
from core.dependencies import get_current_user

router = APIRouter()


@router.post("/register")
def register(payload: RegisterRequest):
    user = register_user(
        email=payload.email,
        password=payload.password,
        role=payload.role,
        first_name=payload.first_name,
        last_name=payload.last_name,
        avatar_url=payload.avatar_url,
    )
    return {
        "message": "User created successfully.",
        "user": user,
    }


@router.post("/login")
def login(payload: LoginRequest):
    return login_user(
        email=payload.email,
        password=payload.password,
    )


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return {
        "user": current_user
    }


@router.post("/logout")
def logout():
    return {
        "message": "Logout successful."
    }