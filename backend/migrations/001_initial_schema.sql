-- Task Management Database Schema
-- PostgreSQL Migration Script

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    deadline DATE,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Insert hardcoded users (password: password123)
-- Hash generated using bcrypt
INSERT INTO users (username, email, hashed_password, full_name) VALUES
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G1fzGp5n5hzNHm', 'Admin User'),
('john', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G1fzGp5n5hzNHm', 'John Doe'),
('jane', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G1fzGp5n5hzNHm', 'Jane Smith'),
('bob', 'bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G1fzGp5n5hzNHm', 'Bob Wilson');

-- Insert sample tasks
INSERT INTO tasks (title, description, status, deadline, assignee_id, created_by) VALUES
('Complete API documentation', 'Write comprehensive API documentation for all endpoints', 'in_progress', CURRENT_DATE + INTERVAL '7 days', 2, 1),
('Fix login bug', 'Users are unable to login with special characters in password', 'todo', CURRENT_DATE + INTERVAL '3 days', 3, 1),
('Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'done', CURRENT_DATE - INTERVAL '2 days', 2, 1),
('Design new dashboard', 'Create mockups for the new admin dashboard', 'in_progress', CURRENT_DATE + INTERVAL '14 days', 4, 2),
('Database optimization', 'Optimize slow queries and add proper indexes', 'todo', CURRENT_DATE, 3, 1);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
