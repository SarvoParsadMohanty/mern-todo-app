import { z } from 'zod';

export const TASK_STATUSES = ['To Do', 'In Progress', 'Done'] as const;
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;

export const createTaskSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string',
    })
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: 'Title is required and cannot be empty or whitespace only',
    })
    .refine((val) => val.length <= 100, {
      message: 'Title must not exceed 100 characters',
    }),
  description: z
    .string({
      invalid_type_error: 'Description must be a string',
    })
    .optional(),
  status: z
    .enum(TASK_STATUSES, {
      errorMap: () => ({ message: 'Status must be one of: To Do, In Progress, Done' }),
    })
    .optional()
    .default('To Do'),
  priority: z
    .enum(TASK_PRIORITIES, {
      errorMap: () => ({ message: 'Priority must be one of: Low, Medium, High' }),
    })
    .optional()
    .default('Medium'),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES, {
    errorMap: () => ({ message: 'Status is required and must be one of: To Do, In Progress, Done' }),
  }),
});

export const getTasksQuerySchema = z.object({
  status: z
    .enum(TASK_STATUSES, {
      errorMap: () => ({ message: 'Invalid status filter. Allowed values: To Do, In Progress, Done' }),
    })
    .optional(),
});
