import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="task-list-card skeleton-container" aria-live="polite" aria-busy="true">
      <div className="task-table-header skeleton-header" aria-hidden="true">
        <div className="col-header col-title">TITLE</div>
        <div className="col-header col-desc">DESCRIPTION</div>
        <div className="col-header col-status">STATUS</div>
        <div className="col-header col-priority">PRIORITY</div>
        <div className="col-header col-date">CREATED</div>
        <div className="col-header col-actions"></div>
      </div>

      <div className="task-table-body">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="task-row skeleton-row">
            <div className="task-cell col-title">
              <div className="skeleton-bar skeleton-title"></div>
            </div>
            <div className="task-cell col-desc">
              <div className="skeleton-bar skeleton-desc"></div>
            </div>
            <div className="task-cell col-status">
              <div className="skeleton-bar skeleton-select"></div>
            </div>
            <div className="task-cell col-priority">
              <div className="skeleton-bar skeleton-badge"></div>
            </div>
            <div className="task-cell col-date">
              <div className="skeleton-bar skeleton-date"></div>
            </div>
            <div className="task-cell col-actions">
              <div className="skeleton-bar skeleton-btn"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
