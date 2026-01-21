"""
Users router for user management and assignee list.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserSimple
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", response_model=List[UserSimple])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all users (for assignee dropdown).
    
    Returns simplified user list with id, username, and full_name.
    Requires authentication.
    """
    users = db.query(User).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific user by ID.
    
    - **user_id**: The ID of the user to retrieve
    
    Returns full user information.
    Requires authentication.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
