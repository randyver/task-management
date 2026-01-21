"""
Database initialization script.
Creates tables and seeds initial data (hardcoded users).
"""

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.task import Task
from app.utils.security import get_password_hash
from datetime import date, timedelta


def init_db():
    """Initialize database with tables and seed data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_user = db.query(User).first()
        if existing_user:
            print("Database already initialized. Skipping seed.")
            return
        
        # Create hardcoded users
        users = [
            User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Admin User"
            ),
            User(
                username="john",
                email="john@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="John Doe"
            ),
            User(
                username="jane",
                email="jane@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Jane Smith"
            ),
            User(
                username="bob",
                email="bob@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="Bob Wilson"
            ),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        print(f"Created {len(users)} users.")
        
        # Create sample tasks
        today = date.today()
        sample_tasks = [
            Task(
                title="Complete API documentation",
                description="Write comprehensive API documentation for all endpoints",
                status="in_progress",
                deadline=today + timedelta(days=7),
                assignee_id=2,  # John
                created_by=1   # Admin
            ),
            Task(
                title="Fix login bug",
                description="Users are unable to login with special characters in password",
                status="todo",
                deadline=today + timedelta(days=3),
                assignee_id=3,  # Jane
                created_by=1   # Admin
            ),
            Task(
                title="Setup CI/CD pipeline",
                description="Configure GitHub Actions for automated testing and deployment",
                status="done",
                deadline=today - timedelta(days=2),
                assignee_id=2,  # John
                created_by=1   # Admin
            ),
            Task(
                title="Design new dashboard",
                description="Create mockups for the new admin dashboard",
                status="in_progress",
                deadline=today + timedelta(days=14),
                assignee_id=4,  # Bob
                created_by=2   # John
            ),
            Task(
                title="Database optimization",
                description="Optimize slow queries and add proper indexes",
                status="todo",
                deadline=today,  # Today
                assignee_id=3,  # Jane
                created_by=1   # Admin
            ),
        ]
        
        for task in sample_tasks:
            db.add(task)
        
        db.commit()
        print(f"Created {len(sample_tasks)} sample tasks.")
        
        print("\n=== Database Initialization Complete ===")
        print("\nHardcoded Users (password: password123):")
        print("  - admin / admin@example.com")
        print("  - john / john@example.com")
        print("  - jane / jane@example.com")
        print("  - bob / bob@example.com")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
