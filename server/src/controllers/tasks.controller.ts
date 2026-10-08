import { Request, Response, NextFunction } from 'express';
import * as tasksService from '../services/tasks.service';
import { TaskStatus } from '../types/task.types';

/**
 * POST /tasks - Create a new task
 */
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await tasksService.createTask(req.body);
    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /tasks - Get all tasks with optional status query parameter
 */
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = req.query.status as TaskStatus | undefined;
    const tasks = await tasksService.getAllTasks(status);
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /tasks/:id - Update status of a task
 */
export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedTask = await tasksService.updateTaskStatus(id, status);
    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /tasks/:id - Delete a task
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTask = await tasksService.deleteTask(id);
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { _id: deletedTask._id },
    });
  } catch (error) {
    next(error);
  }
};

// Export tasksController object for backward compatibility
export const tasksController = {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
};
