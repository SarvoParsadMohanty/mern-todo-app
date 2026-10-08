import React, { useEffect } from 'react';
import { Task } from '../types/task';
import { Loader2, X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div
      className="modal-overlay"
      onClick={isDeleting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="modal-content modal-content-delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-brand">
            <div className="delete-icon-badge">
              <AlertTriangle size={16} />
            </div>
            <h2 id="delete-modal-title" className="modal-title">Delete task</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close delete confirmation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-warning-text">
            Are you sure you want to delete{' '}
            <strong className="task-title-highlight">"{task.title}"</strong>?
          </p>
          <p className="delete-subtext">This action cannot be undone.</p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete task</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
