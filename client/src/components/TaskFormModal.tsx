import React, { useState, useEffect } from 'react';
import { Task, CreateTaskInput, TaskStatus, TaskPriority } from '../types/task';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<Task | void>;
  isSubmitting: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setPriority('Medium');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    if (trimmedTitle.length > 100) {
      setError('Title must not exceed 100 characters');
      return;
    }

    setError(null);

    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
        status,
        priority,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create task. Please try again.');
      }
    }
  };

  const titleLength = title.trim().length;

  return (
    <div
      className="modal-overlay"
      onClick={isSubmitting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">Create task</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {error && (
            <div className="form-error-banner" role="alert">
              <AlertCircle size={16} className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="task-title" className="form-label">
                Title <span className="required-star">*</span>
              </label>
              <span className={`char-counter ${titleLength > 100 ? 'counter-exceeded' : ''}`}>
                {titleLength}/100
              </span>
            </div>
            <input
              id="task-title"
              type="text"
              className={`form-input ${error && !title.trim() ? 'input-error' : ''}`}
              placeholder="e.g. Complete interview assignment"
              value={title}
              maxLength={120}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description" className="form-label">
              Description <span className="optional-tag">(optional)</span>
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              rows={3}
              placeholder="Add details or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row-two">
            <div className="form-group">
              <label htmlFor="task-status" className="form-label">
                Status
              </label>
              <select
                id="task-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                disabled={isSubmitting}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority" className="form-label">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim() || titleLength > 100}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={15} />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
