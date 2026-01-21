"""
Tasks router for full CRUD operations on tasks.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.database import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskStatusUpdate,
    TaskListResponse,
    TaskStatusEnum
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=TaskListResponse)
async def get_all_tasks(
    status: Optional[TaskStatusEnum] = None,
    assignee_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tasks with optional filtering and pagination.
    
    - **status**: Filter by task status (todo, in_progress, done)
    - **assignee_id**: Filter by assignee user ID
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 10, max: 100)
    
    Returns paginated list of tasks with total count.
    """
    query = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    )
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status.value)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    tasks = query.order_by(Task.created_at.desc()).offset(offset).limit(page_size).all()
    
    return TaskListResponse(
        tasks=tasks,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_by_id(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific task by ID.
    
    - **task_id**: The ID of the task to retrieve
    """
    task = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    ).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task.
    
    - **title**: Task title (required)
    - **description**: Task description (optional)
    - **status**: Task status (default: todo)
    - **deadline**: Task deadline date (optional)
    - **assignee_id**: ID of user to assign task to (optional)
    
    The current user is automatically set as the task creator.
    """
    # Validate assignee exists if provided
    if task_data.assignee_id:
        assignee = db.query(User).filter(User.id == task_data.assignee_id).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assignee user not found"
            )
    
    # Create task
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status.value,
        deadline=task_data.deadline,
        assignee_id=task_data.assignee_id,
        created_by=current_user.id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Reload with relationships
    task = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    ).filter(Task.id == task.id).first()
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing task.
    
    - **task_id**: The ID of the task to update
    - All fields are optional, only provided fields will be updated
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Validate assignee exists if provided
    if task_data.assignee_id is not None:
        if task_data.assignee_id:  # Not None and not 0
            assignee = db.query(User).filter(User.id == task_data.assignee_id).first()
            if not assignee:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assignee user not found"
                )
    
    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status" and value:
            setattr(task, field, value.value)
        else:
            setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    # Reload with relationships
    task = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    ).filter(Task.id == task.id).first()
    
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update only the status of a task.
    
    - **task_id**: The ID of the task to update
    - **status**: New status (todo, in_progress, done)
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.status = status_data.status.value
    db.commit()
    db.refresh(task)
    
    # Reload with relationships
    task = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    ).filter(Task.id == task.id).first()
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a task.
    
    - **task_id**: The ID of the task to delete
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    
    return None
