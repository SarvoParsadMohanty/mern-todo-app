import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db';
import { mapRowToTask } from '../models/task.model';
import { CreateTaskInput, TaskStatus, ITask, ITaskRow } from '../types/task.types';
import { AppError } from '../utils/appError';

/**
 * Helper to validate task ID format
 */
const validateTaskId = (id: string): void => {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new AppError('Invalid task ID format', 400, 'INVALID_ID');
  }
  // Allow standard UUID or string ID format
  if (id.length > 50) {
    throw new AppError('Invalid task ID format', 400, 'INVALID_ID');
  }
};

/**
 * Create a new task in PostgreSQL database.
 */
export const createTask = async (input: CreateTaskInput): Promise<ITask> => {
  const id = uuidv4();
  const title = input.title;
  const description = input.description || '';
  const status = input.status || 'To Do';
  const priority = input.priority || 'Medium';

  const queryText = `
    INSERT INTO tasks (id, title, description, status, priority, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *;
  `;

  const result = await db.query<ITaskRow>(queryText, [id, title, description, status, priority]);
  return mapRowToTask(result.rows[0]);
};

/**
 * Retrieve tasks with optional status filtering.
 * Sorted newest first (created_at DESC).
 */
export const getAllTasks = async (status?: TaskStatus): Promise<ITask[]> => {
  let queryText = 'SELECT * FROM tasks';
  const params: unknown[] = [];

  if (status) {
    queryText += ' WHERE status = $1';
    params.push(status);
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await db.query<ITaskRow>(queryText, params);
  return result.rows.map(mapRowToTask);
};

/**
 * Update task status in PostgreSQL.
 */
export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<ITask> => {
  validateTaskId(id);

  const queryText = `
    UPDATE tasks
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;

  const result = await db.query<ITaskRow>(queryText, [status, id]);

  if (result.rows.length === 0) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  }

  return mapRowToTask(result.rows[0]);
};

/**
 * Delete a task by ID in PostgreSQL.
 */
export const deleteTask = async (id: string): Promise<ITask> => {
  validateTaskId(id);

  const queryText = `
    DELETE FROM tasks
    WHERE id = $1
    RETURNING *;
  `;

  const result = await db.query<ITaskRow>(queryText, [id]);

  if (result.rows.length === 0) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  }

  return mapRowToTask(result.rows[0]);
};

// Export tasksService object for backward compatibility
export const tasksService = {
  createTask,
  getAllTasks,
  updateTaskStatus,
  deleteTask,
};
