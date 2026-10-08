import React from 'react';
import { Task, TaskStatus } from '../types/task';
import { formatRelativeTime, formatDate } from '../utils/formatDate';
import { Trash2, Loader2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onDeleteClick: (task: Task) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDeleteClick,
  isUpdating,
  isDeleting,
}) => {
  const isBusy = isUpdating || isDeleting;

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'priority-tag priority-high';
      case 'Medium':
        return 'priority-tag priority-medium';
      case 'Low':
        return 'priority-tag priority-low';
      default:
        return 'priority-tag';
    }
  };

  const getStatusDotClass = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return 'status-dot status-dot-done';
      case 'In Progress':
        return 'status-dot status-dot-in-progress';
      case 'To Do':
        return 'status-dot status-dot-todo';
      default:
        return 'status-dot';
    }
  };

  return (
    <article
      className={`task-row ${task.status === 'Done' ? 'task-row-done' : ''} ${
        isBusy ? 'task-row-busy' : ''
      }`}
    >
      {/* Column 1: TITLE */}
      <div className="task-cell col-title">
        <h3 className="task-row-title" title={task.title}>
          {task.title}
        </h3>
      </div>

      {/* Column 2: DESCRIPTION */}
      <div className="task-cell col-desc">
        {task.description ? (
          <p className="task-row-description" title={task.description}>
            {task.description}
          </p>
        ) : (
          <span className="task-row-no-desc">—</span>
        )}
      </div>

      {/* Column 3: STATUS */}
      <div className="task-cell col-status">
        <div className="status-select-wrapper">
          <span className={getStatusDotClass(task.status)} />
          <label htmlFor={`status-select-${task._id}`} className="sr-only">
            Change status for {task.title}
          </label>
          <select
            id={`status-select-${task._id}`}
            value={task.status}
            disabled={isBusy}
            onChange={(e) => onStatusChange(task._id, e.target.value as TaskStatus)}
            className="status-select-input"
            aria-label={`Status for ${task.title}: current status ${task.status}`}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          {isUpdating && <Loader2 className="status-spinner animate-spin" size={13} />}
        </div>
      </div>

      {/* Column 4: PRIORITY */}
      <div className="task-cell col-priority">
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
      </div>

      {/* Column 5: CREATED */}
      <div className="task-cell col-date" title={formatDate(task.createdAt)}>
        {formatRelativeTime(task.createdAt)}
      </div>

      {/* Column 6: ACTIONS */}
      <div className="task-cell col-actions">
        <button
          type="button"
          className="btn-icon-danger"
          onClick={() => onDeleteClick(task)}
          disabled={isBusy}
          aria-label={`Delete task "${task.title}"`}
          title="Delete task"
        >
          {isDeleting ? (
            <Loader2 className="animate-spin" size={15} />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>
    </article>
  );
};
