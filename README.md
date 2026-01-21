# Task Management Application

A full-stack task management application with AI-powered chatbot built with **Next.js**, **FastAPI**, and **PostgreSQL**.

![Task Management App](https://via.placeholder.com/800x400?text=Task+Management+App)

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure login
- **Task Management**: Full CRUD operations for tasks
- **Task Status**: Track tasks through Todo → In Progress → Done
- **Assignee Management**: Assign tasks to team members
- **AI Chatbot**: Natural language queries about tasks using Google Gemini
- **Responsive UI**: Modern, minimalist design with ShadcnUI

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS
- **ShadcnUI** - Accessible UI components
- **Lucide Icons** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - Python ORM
- **JWT** - JSON Web Token authentication
- **Google Gemini** - AI chatbot integration

## 📁 Project Structure

```
task-management/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database connection
│   │   └── main.py            # Application entry
│   ├── migrations/            # SQL migrations
│   ├── requirements.txt
│   └── init_db.py             # Database initialization
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   ├── components/        # React components
│   │   ├── context/           # React context
│   │   ├── lib/               # Utilities & API
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Google Gemini API Key** (for AI chatbot)

### 1. Clone the Repository

```bash
git clone <repository-url>
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

## 👤 Demo Credentials

All demo users have the same password: `password123`

| Username | Email | Full Name |
|----------|-------|-----------|
| admin | admin@example.com | Admin User |
| john | john@example.com | John Doe |
| jane | jane@example.com | Jane Smith |
| bob | bob@example.com | Bob Wilson |

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (OAuth2 form) |
| POST | `/api/auth/login/json` | Login (JSON body) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with filters) |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/status` | Update task status |
| DELETE | `/api/tasks/{id}` | Delete task |

### Chatbot

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/query` | Query AI chatbot |

## 🤖 AI Chatbot

### How It Works

The AI chatbot is powered by Google Gemini and can answer questions about your tasks in natural language.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Backend   │────▶│  PostgreSQL │
│   Query     │     │   FastAPI   │     │   Database  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Gemini    │
                   │     AI      │
                   └─────────────┘
```

### Query Flow

1. User sends a natural language question
2. Backend fetches all tasks from PostgreSQL
3. Backend constructs a context prompt with task data
4. Gemini AI processes the query with context
5. Response is returned to the user

### Prompt Design

The chatbot uses a structured prompt that includes:

```
You are a helpful task management assistant. You have access to the following task data:

TODAY'S DATE: 2024-01-21

CURRENT TASKS IN THE SYSTEM:
- ID: 1 | Title: "Complete API documentation" | Status: In Progress | Deadline: 2024-01-28 | Assignee: John Doe
- ID: 2 | Title: "Fix login bug" | Status: Todo | Deadline: 2024-01-24 | Assignee: Jane Smith
...

USER QUESTION: {user_query}

Please provide a helpful, accurate response based on the task data above.
```

### Example Queries

Try these queries in the AI Assistant:

1. **"Show all tasks that are not completed"**
   - Returns all tasks with status "todo" or "in_progress"

2. **"How many completed tasks are there?"**
   - Counts and returns the number of tasks with status "done"

3. **"Which tasks have deadlines today?"**
   - Lists tasks where deadline matches today's date

4. **"Who is the assignee of task 'Complete API documentation'?"**
   - Returns the assigned user for the specified task

5. **"What tasks are assigned to John?"**
   - Lists all tasks assigned to John Doe

6. **"Give me a summary of all overdue tasks"**
   - Lists tasks where deadline is past and status is not "done"

### Testing the Chatbot

1. Start the backend server with a valid `GEMINI_API_KEY`
2. Login to the frontend
3. Navigate to "AI Assistant" in the navigation
4. Type your question and press Enter

## 🗄 Database Schema

### ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────┐
│            users                │
├─────────────────────────────────┤
│ id           SERIAL PRIMARY KEY │
│ username     VARCHAR(50) UNIQUE │
│ email        VARCHAR(100) UNIQUE│
│ hashed_password VARCHAR(255)    │
│ full_name    VARCHAR(100)       │
│ created_at   TIMESTAMP          │
│ updated_at   TIMESTAMP          │
└─────────────────────────────────┘
         │
         │ 1:N (assignee_id)
         │ 1:N (created_by)
         ▼
┌─────────────────────────────────┐
│            tasks                │
├─────────────────────────────────┤
│ id           SERIAL PRIMARY KEY │
│ title        VARCHAR(200)       │
│ description  TEXT               │
│ status       VARCHAR(20)        │
│ deadline     DATE               │
│ assignee_id  FK → users(id)     │
│ created_by   FK → users(id)     │
│ created_at   TIMESTAMP          │
│ updated_at   TIMESTAMP          │
└─────────────────────────────────┘
```

### Status Values

| Value | Display | Description |
|-------|---------|-------------|
| `todo` | To Do | Task not started |
| `in_progress` | In Progress | Task being worked on |
| `done` | Done | Task completed |

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Build Check

```bash
cd frontend
npm run build
npm run lint
```

## 📮 Postman Collection

Import the Postman collection from `postman/Task_Management_API.json` to test all API endpoints.

See [Postman Documentation](postman/README.md) for detailed examples.

## 🔒 Security Notes

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Store sensitive data in environment variables
- Implement rate limiting for production
- Add proper input validation

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

---

Made with ❤️ using Next.js, FastAPI, and Gemini AI
