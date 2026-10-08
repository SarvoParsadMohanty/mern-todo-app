import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} from '../controllers/tasks.controller';
import { validateRequest } from '../middleware/validateRequest';
import {
  createTaskSchema,
  updateTaskStatusSchema,
  getTasksQuerySchema,
} from '../validators/task.validator';

const router = Router();

router
  .route('/')
  .post(validateRequest(createTaskSchema, 'body'), createTask)
  .get(validateRequest(getTasksQuerySchema, 'query'), getTasks);

router
  .route('/:id')
  .patch(validateRequest(updateTaskStatusSchema, 'body'), updateTaskStatus)
  .delete(deleteTask);

export const tasksRouter = router;
