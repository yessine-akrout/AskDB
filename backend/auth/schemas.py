from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "employee"
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
    created_at: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse