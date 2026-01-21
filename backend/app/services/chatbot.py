"""
Chatbot service using Google Gemini AI.
Processes natural language queries about task data.
"""

import google.generativeai as genai
from sqlalchemy.orm import Session, joinedload
from datetime import date
from typing import Optional

from app.config import get_settings
from app.models.task import Task
from app.models.user import User

settings = get_settings()


class ChatbotService:
    """
    Service class for AI-powered task queries using Gemini.
    
    This service:
    1. Fetches relevant task data from the database
    2. Constructs a context-aware prompt
    3. Sends the query to Gemini AI
    4. Returns a natural language response
    """
    
    def __init__(self):
        """Initialize the Gemini AI client."""
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            self.model = None
    
    def _format_task_data(self, tasks: list[Task]) -> str:
        """
        Format task data into a readable string for the AI context.
        
        Args:
            tasks: List of Task objects from database
            
        Returns:
            Formatted string representation of tasks
        """
        if not tasks:
            return "No tasks found in the system."
        
        task_lines = []
        for task in tasks:
            assignee_name = task.assignee.full_name if task.assignee else "Unassigned"
            deadline_str = task.deadline.strftime("%Y-%m-%d") if task.deadline else "No deadline"
            
            # Map status to readable format
            status_map = {
                "todo": "Todo",
                "in_progress": "In Progress",
                "done": "Done"
            }
            status_readable = status_map.get(task.status, task.status)
            
            task_lines.append(
                f"- ID: {task.id} | Title: \"{task.title}\" | "
                f"Status: {status_readable} | Deadline: {deadline_str} | "
                f"Assignee: {assignee_name}"
            )
        
        return "\n".join(task_lines)
    
    def _build_prompt(self, user_query: str, task_data: str, today: str) -> str:
        """
        Build the complete prompt for Gemini AI.
        
        Args:
            user_query: The user's natural language question
            task_data: Formatted task data string
            today: Today's date string
            
        Returns:
            Complete prompt string
        """
        return f"""You are a helpful task management assistant. Your role is to answer questions about tasks in the system based on the provided data.

TODAY'S DATE: {today}

CURRENT TASKS IN THE SYSTEM:
{task_data}

IMPORTANT INSTRUCTIONS:
1. Only answer questions based on the task data provided above
2. Be concise and helpful in your responses
3. If asked about tasks that don't exist, politely inform the user
4. When counting tasks, be accurate
5. Format your response in PLAIN TEXT only - no markdown, no asterisks, no bullet points with symbols
6. Use simple line breaks and dashes (-) for lists if needed
7. If the question is unclear, ask for clarification
8. Do not make up information that is not in the task data

USER QUESTION: {user_query}

Please provide a helpful response based on the task data above."""

    async def process_query(self, db: Session, user_query: str) -> dict:
        """
        Process a natural language query about tasks.
        
        Args:
            db: Database session
            user_query: User's question about tasks
            
        Returns:
            Dictionary with response and success status
        """
        # Check if Gemini is configured
        if not self.model:
            return {
                "response": "AI chatbot is not configured. Please set GEMINI_API_KEY in environment variables.",
                "success": False,
                "error": "GEMINI_API_KEY not configured"
            }
        
        try:
            # Fetch all tasks with relationships
            tasks = db.query(Task).options(
                joinedload(Task.assignee),
                joinedload(Task.creator)
            ).all()
            
            # Format task data for context
            task_data = self._format_task_data(tasks)
            today = date.today().strftime("%Y-%m-%d")
            
            # Build the prompt
            prompt = self._build_prompt(user_query, task_data, today)
            
            # Generate response from Gemini
            response = self.model.generate_content(prompt)
            
            return {
                "response": response.text,
                "success": True,
                "error": None
            }
            
        except Exception as e:
            return {
                "response": f"An error occurred while processing your query: {str(e)}",
                "success": False,
                "error": str(e)
            }


# Singleton instance
chatbot_service = ChatbotService()


def get_chatbot_service() -> ChatbotService:
    """Get the chatbot service instance."""
    return chatbot_service
