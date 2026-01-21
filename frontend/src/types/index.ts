/**
 * TypeScript type definitions for the application.
 */

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserSimple {
  id: number;
  username: string;
  full_name: string;
}

// Task types
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string | null;
  assignee_id: number | null;
  assignee: UserSimple | null;
  created_by: number;
  creator: UserSimple;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  deadline?: string;
  assignee_id?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  deadline?: string;
  assignee_id?: number | null;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// Chatbot types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatQuery {
  message: string;
}

export interface ChatResponse {
  response: string;
  success: boolean;
  error?: string;
}

// API Response types
export interface ApiError {
  detail: string;
}
