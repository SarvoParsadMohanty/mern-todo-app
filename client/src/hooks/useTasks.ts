import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, FilterStatus, CreateTaskInput } from '../types/task';
import { taskApi } from '../services/taskApi';
import { ToastMessage } from '../components/NotificationToast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());
  const [deletingTaskIds, setDeletingTaskIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const fetchTasks = useCallback(async (statusFilter?: FilterStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilter = statusFilter !== undefined ? statusFilter : filter;
      const fetchedTasks = await taskApi.getTasks(activeFilter);
      setTasks(fetchedTasks);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Initial load
  useEffect(() => {
    fetchTasks(filter);
  }, [filter, fetchTasks]);

  // Create Task
  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    setIsCreating(true);
    try {
      const newTask = await taskApi.createTask(input);
      
      // Update local state smoothly: append or insert at beginning if matches current filter
      if (filter === 'All' || filter === newTask.status) {
        setTasks((prev) => [newTask, ...prev]);
      }
      showToast('success', `Task "${newTask.title}" created successfully!`);
      return newTask;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task';
      showToast('error', msg);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Update Task Status
  const updateTaskStatus = async (id: string, newStatus: TaskStatus) => {
    setUpdatingTaskIds((prev) => new Set(prev).add(id));
    
    // Remember original task in case of error
    const targetTask = tasks.find((t) => t._id === id);
    if (!targetTask) return;
    const oldStatus = targetTask.status;

    try {
      // Optimistically update or wait for server confirmation
      const updatedTask = await taskApi.updateTaskStatus(id, newStatus);
      
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updatedTask : t))
      );

      // If active filter does not match new status, refetch or filter out after short delay
      if (filter !== 'All' && filter !== newStatus) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      }

      showToast('success', `Status updated from "${oldStatus}" to "${newStatus}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update task status';
      
      // Revert local state if changed
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: oldStatus } : t))
      );
      
      showToast('error', msg);
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Delete Task
  const deleteTask = async (id: string) => {
    const targetTask = tasks.find((t) => t._id === id);
    const taskTitle = targetTask?.title || 'Task';

    setDeletingTaskIds((prev) => new Set(prev).add(id));

    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('success', `Task "${taskTitle}" deleted successfully`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task';
      showToast('error', msg);
      throw err;
    } finally {
      setDeletingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Calculate task counts across statuses
  const counts = useMemo(() => {
    const c = {
      All: tasks.length,
      'To Do': 0,
      'In Progress': 0,
      Done: 0,
    };
    tasks.forEach((task) => {
      if (task.status in c) {
        c[task.status as keyof typeof c]++;
      }
    });
    return c;
  }, [tasks]);

  return {
    tasks,
    filter,
    setFilter,
    isLoading,
    error,
    updatingTaskIds,
    deletingTaskIds,
    isCreating,
    toast,
    counts,
    fetchTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    dismissToast,
  };
};
