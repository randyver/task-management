"""
FastAPI Application Entry Point.

This is the main application file that:
- Creates the FastAPI app instance
- Configures CORS middleware
- Registers all routers
- Sets up database initialization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, users, tasks, chatbot

# Import models to register them with SQLAlchemy
from app.models import user, task

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Creates database tables on startup.
    """
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup on shutdown (if needed)


# Create FastAPI application
app = FastAPI(
    title="Task Management API",
    description="""
    A simple task management API with JWT authentication and AI chatbot.
    
    ## Features
    
    * **Authentication**: JWT-based authentication with login/logout
    * **Users**: Get user list for task assignment
    * **Tasks**: Full CRUD operations with filtering and pagination
    * **AI Chatbot**: Natural language queries about tasks using Gemini
    
    ## Authentication
    
    Use the `/api/auth/login` endpoint to get a JWT token.
    Include the token in the Authorization header: `Bearer <token>`
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(chatbot.router)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "Task Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}
