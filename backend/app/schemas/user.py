"""
Pydantic schemas for User operations.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base schema with common user fields."""
    username: str
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str


class UserResponse(UserBase):
    """Schema for user response (without password)."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSimple(BaseModel):
    """Simplified user schema for assignee list."""
    id: int
    username: str
    full_name: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    username: Optional[str] = None
    user_id: Optional[int] = None
