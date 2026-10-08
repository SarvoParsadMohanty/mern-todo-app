import { Task, CreateTaskInput, TaskStatus, FilterStatus, ApiResponse } from '../types/task';

const API_BASE_URL = '/tasks';

class ApiError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Network error or invalid server response format');
  }

  if (!response.ok || !data.success) {
    const errorMessage = data.error?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, data.error?.code, data.error?.details);
  }

  return data.data as T;
}

export const taskApi = {
  /**
   * Fetch tasks, optionally filtered by status
   */
  async getTasks(status?: FilterStatus): Promise<Task[]> {
    let url = API_BASE_URL;
    if (status && status !== 'All') {
      url += `?status=${encodeURIComponent(status)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    return handleResponse<Task[]>(response);
  },

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return handleResponse<Task>(response);
  },

  /**
   * Update status of an existing task
   */
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    return handleResponse<Task>(response);
  },

  /**
   * Delete a task by ID
   */
  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    await handleResponse<{ _id: string }>(response);
  },
};
