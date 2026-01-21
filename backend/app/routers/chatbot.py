"""
Chatbot router for AI-powered task queries.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.chatbot import ChatQuery, ChatResponse
from app.services.chatbot import get_chatbot_service, ChatbotService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


@router.post("/query", response_model=ChatResponse)
async def query_chatbot(
    query: ChatQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    chatbot: ChatbotService = Depends(get_chatbot_service)
):
    """
    Send a natural language query to the AI chatbot.
    
    The chatbot can answer questions about tasks such as:
    - "Show all tasks that are not completed"
    - "How many completed tasks are there?"
    - "Which tasks have deadlines today?"
    - "Who is the assignee of task [task title]?"
    
    - **message**: The natural language question about tasks
    
    Returns AI-generated response based on current task data.
    Requires authentication.
    """
    result = await chatbot.process_query(db, query.message)
    
    return ChatResponse(
        response=result["response"],
        success=result["success"],
        error=result.get("error")
    )
