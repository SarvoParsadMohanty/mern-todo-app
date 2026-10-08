import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="error-state-card" role="alert">
      <div className="error-icon-wrapper">
        <AlertCircle size={28} className="error-icon" />
      </div>
      <div className="error-content">
        <h3 className="error-title">Unable to load tasks</h3>
        <p className="error-message">
          {message || 'Something went wrong while loading your tasks.'}
        </p>
      </div>
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        <RefreshCw size={14} />
        <span>Try again</span>
      </button>
    </div>
  );
};
