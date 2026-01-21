# Task Management Application

A full-stack task management application with AI-powered chatbot.

![Task Management App](docs/app.png)

## Features

- User Authentication: JWT-based authentication with secure login
- Task Management: Full CRUD operations for tasks
- Task Status: Track tasks through Todo → In Progress → Done
- Assignee Management: Assign tasks to team members
- AI Chatbot: Natural language queries about tasks using Google Gemini
- Responsive UI: Modern, minimalist design with ShadcnUI

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- ShadcnUI
- Lucide Icons

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT
- Google Gemini

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Google Gemini API Key (for AI chatbot)

### 1. Clone the Repository

```bash
git clone https://github.com/randyver/task-management
cd task-management
```

### 2. Setup PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE taskdb;
```

Or run the migration script:

```bash
psql -U postgres -f backend/migrations/001_initial_schema.sql
```

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux

# Edit .env with your configuration
```

#### Backend Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskdb

# JWT Settings
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini AI (Get key from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key
```

#### Initialize Database with Seed Data

```bash
python init_db.py
```

This creates:
- 4 demo users (admin, john, jane, bob)
- 5 sample tasks

#### Run Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.local.example .env.local   # Windows
cp .env.local.example .env.local     # macOS/Linux
```

#### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Run Frontend Server

```bash
npm run dev
```

The application will be available at: http://localhost:3000

## Demo Credentials

All demo users have the same password: `password123`

| Username | Email | Full Name |
|----------|-------|-----------|
| admin | admin@example.com | Admin User |
| john | john@example.com | John Doe |
| jane | jane@example.com | Jane Smith |
| bob | bob@example.com | Bob Wilson |

## AI Chatbot

![Chatbot UI](docs/chatbot-ui.png)

### How It Works

The AI chatbot is powered by Google Gemini and can answer questions about your tasks in natural language.

![Chatbot Flow](docs/chatbot-flow.png)

### Query Flow

1. User sends a natural language question
2. Backend fetches all tasks from PostgreSQL
3. Backend constructs a context prompt with task data
4. Gemini AI processes the query with context
5. Response is returned to the user

### Testing the Chatbot

1. Start the backend server with a valid `GEMINI_API_KEY`
2. Login to the frontend
3. Click the AI Assistant located at the bottom-right corner of the screen
4. Type your question and press Enter

## Database Schema

### ERD (Entity Relationship Diagram)

![ERD](docs/erd.png)

## Postman Collection

Import the Postman collection from `postman/Task_Management_API.json` to test all API endpoints.

See [Postman Documentation](postman/README.md) for detailed examples.
