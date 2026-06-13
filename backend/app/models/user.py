from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: str
    password: str


class UserPreferences(BaseModel):
    default_height: Optional[float] = 170
    default_weight: Optional[float] = 70
    body_type: Optional[str] = "regular"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    preferences: UserPreferences = UserPreferences()
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
