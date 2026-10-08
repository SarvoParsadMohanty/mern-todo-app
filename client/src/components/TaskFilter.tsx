import React from 'react';
import { FilterStatus } from '../types/task';

interface TaskFilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  counts: {
    All: number;
    'To Do': number;
    'In Progress': number;
    Done: number;
  };
}

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'All' },
  { label: 'To Do', value: 'To Do' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Done', value: 'Done' },
];

export const TaskFilter: React.FC<TaskFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <nav className="task-filter-nav" aria-label="Task Status Filters">
      <div className="filter-segmented-group" role="tablist">
        {FILTER_OPTIONS.map((option) => {
          const isSelected = currentFilter === option.value;
          const count = counts[option.value as keyof typeof counts] || 0;

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`filter-tab ${isSelected ? 'active' : ''}`}
              onClick={() => onFilterChange(option.value)}
            >
              <span className="tab-label">{option.label}</span>
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
