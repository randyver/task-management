# Postman API Documentation

This folder contains the Postman collection for the Task Management API.

## Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Task_Management_API.json`
4. The collection will be imported with all endpoints

## Authentication Flow

1. Run the **"Login (JSON)"** request first
2. The token will be automatically saved to the collection variable `{{token}}`
3. All subsequent requests will use this token automatically

## Available Endpoints

### Authentication
| Request | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| Login (JSON) | POST | `/api/auth/login/json` | Login with JSON body |
| Login (Form) | POST | `/api/auth/login` | Login with form data |
| Get Current User | GET | `/api/auth/me` | Get authenticated user info |
| Logout | POST | `/api/auth/logout` | Logout current user |

### Users
| Request | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| Get All Users | GET | `/api/users` | List all users |
| Get User by ID | GET | `/api/users/{id}` | Get specific user |

### Tasks
| Request | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| Get All Tasks | GET | `/api/tasks` | List tasks with filters |
| Get Tasks by Status | GET | `/api/tasks?status=todo` | Filter by status |
| Get Task by ID | GET | `/api/tasks/{id}` | Get specific task |
| Create Task | POST | `/api/tasks` | Create new task |
| Update Task | PUT | `/api/tasks/{id}` | Update task |
| Update Task Status | PATCH | `/api/tasks/{id}/status` | Change status only |
| Delete Task | DELETE | `/api/tasks/{id}` | Delete task |

### Chatbot
| Request | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| Query - Incomplete | POST | `/api/chatbot/query` | List incomplete tasks |
| Query - Count | POST | `/api/chatbot/query` | Count completed tasks |
| Query - Today | POST | `/api/chatbot/query` | Tasks due today |
| Query - Assignee | POST | `/api/chatbot/query` | Find task assignee |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:8000` |
| `token` | JWT access token | Auto-set on login |

## Example Requests

### Login
```json
POST /api/auth/login/json
{
    "username": "admin",
    "password": "password123"
}
```

### Create Task
```json
POST /api/tasks
Authorization: Bearer {{token}}
{
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "deadline": "2024-02-01",
    "assignee_id": 2
}
```

### Query Chatbot
```json
POST /api/chatbot/query
Authorization: Bearer {{token}}
{
    "message": "Show all tasks that are not completed"
}
```

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Delete) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |
