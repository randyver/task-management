"""
Pydantic schemas for Chatbot operations.
"""

from pydantic import BaseModel
from typing import Optional


class ChatQuery(BaseModel):
    """Schema for chatbot query request."""
    message: str


class ChatResponse(BaseModel):
    """Schema for chatbot response."""
    response: str
    success: bool = True
    error: Optional[str] = None
