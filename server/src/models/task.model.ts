import { ITaskRow, ITask } from '../types/task.types';

export const mapRowToTask = (row: ITaskRow): ITask => {
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
};
