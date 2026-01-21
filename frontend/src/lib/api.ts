/**
 * API client for communicating with the FastAPI backend.
 */

import {
  AuthToken,
  LoginCredentials,
  User,
  UserSimple,
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  ChatResponse,
  TaskStatus,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get stored auth token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Set auth token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('token');
}

/**
 * Create headers with optional auth token
 */
function createHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
}

// ============ Auth API ============

/**
 * Login user and get JWT token
 */
export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const response = await fetch(`${API_URL}/api/auth/login/json`, {
    method: 'POST',
    headers: createHeaders(false),
    body: JSON.stringify(credentials),
  });

  return handleResponse<AuthToken>(response);
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<User>(response);
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: createHeaders(),
    });
  } finally {
    removeToken();
  }
}

// ============ Users API ============

/**
 * Get all users (for assignee list)
 */
export async function getUsers(): Promise<UserSimple[]> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<UserSimple[]>(response);
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<User>(response);
}

// ============ Tasks API ============

/**
 * Get all tasks with optional filters
 */
export async function getTasks(params?: {
  status?: TaskStatus;
  assignee_id?: number;
  page?: number;
  page_size?: number;
}): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.status) searchParams.append('status', params.status);
  if (params?.assignee_id) searchParams.append('assignee_id', params.assignee_id.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.page_size) searchParams.append('page_size', params.page_size.toString());

  const url = `${API_URL}/api/tasks${searchParams.toString() ? `?${searchParams}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<TaskListResponse>(response);
}

/**
 * Get task by ID
 */
export async function getTaskById(id: number): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse<Task>(response);
}

/**
 * Create a new task
 */
export async function createTask(task: TaskCreate): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(task),
  });

  return handleResponse<Task>(response);
}

/**
 * Update an existing task
 */
export async function updateTask(id: number, task: TaskUpdate): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(task),
  });

  return handleResponse<Task>(response);
}

/**
 * Update task status only
 */
export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}/status`, {
    method: 'PATCH',
    headers: createHeaders(),
    body: JSON.stringify({ status }),
  });

  return handleResponse<Task>(response);
}

/**
 * Delete a task
 */
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: createHeaders(),
  });

  return handleResponse<void>(response);
}

// ============ Chatbot API ============

/**
 * Send a query to the AI chatbot
 */
export async function queryChatbot(message: string): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/chatbot/query`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ message }),
  });

  return handleResponse<ChatResponse>(response);
}
