"""
Pydantic schemas for Task operations.
"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum


class TaskStatusEnum(str, Enum):
    """Enum for task status."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskBase(BaseModel):
    """Base schema with common task fields."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.TODO
    deadline: Optional[date] = None
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    deadline: Optional[date] = None
    assignee_id: Optional[int] = None


class TaskStatusUpdate(BaseModel):
    """Schema for updating only task status."""
    status: TaskStatusEnum


class AssigneeInfo(BaseModel):
    """Schema for assignee information in task response."""
    id: int
    username: str
    full_name: str

    class Config:
        from_attributes = True


class CreatorInfo(BaseModel):
    """Schema for creator information in task response."""
    id: int
    username: str
    full_name: str

    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    """Schema for task response with relationships."""
    id: int
    title: str
    description: Optional[str]
    status: TaskStatusEnum
    deadline: Optional[date]
    assignee_id: Optional[int]
    assignee: Optional[AssigneeInfo]
    created_by: int
    creator: CreatorInfo
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""
    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int
