import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  totalTasks: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <h1 className="brand-title">Task Tracker</h1>
          <p className="brand-subtitle">Manage and track your tasks</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
            aria-label="New Task"
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
