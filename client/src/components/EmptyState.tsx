import React from 'react';
import { FilterStatus } from '../types/task';
import { Plus, CheckSquare } from 'lucide-react';

interface EmptyStateProps {
  currentFilter: FilterStatus;
  onOpenCreateModal: () => void;
  onClearFilter: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  currentFilter,
  onOpenCreateModal,
  onClearFilter,
}) => {
  const isFiltered = currentFilter !== 'All';

  return (
    <div className="empty-state-card">
      <div className="empty-icon-wrapper">
        <CheckSquare size={32} className="empty-icon" />
      </div>

      <h3 className="empty-title">
        {isFiltered ? `No ${currentFilter} tasks` : 'No tasks yet'}
      </h3>

      <p className="empty-description">
        {isFiltered
          ? `There are currently no tasks with status "${currentFilter}".`
          : 'Create your first task to start tracking your work.'}
      </p>

      <div className="empty-actions">
        {isFiltered && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClearFilter}
          >
            Show all tasks
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateModal}
        >
          <Plus size={16} />
          <span>Create task</span>
        </button>
      </div>
    </div>
  );
};
