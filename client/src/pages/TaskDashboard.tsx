import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';
import { Header } from '../components/Header';
import { TaskFilter } from '../components/TaskFilter';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { NotificationToast } from '../components/NotificationToast';

export const TaskDashboard: React.FC = () => {
  const {
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
  } = useTasks();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete._id);
      setTaskToDelete(null);
    } catch {
      // Error handled in hook & toast
    }
  };

  return (
    <div className="app-layout">
      <Header
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        totalTasks={counts.All}
      />

      <main className="main-content">
        <div className="content-container">
          <div className="dashboard-controls">
            <TaskFilter
              currentFilter={filter}
              onFilterChange={setFilter}
              counts={counts}
            />
          </div>

          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => fetchTasks(filter)} />
          ) : tasks.length === 0 ? (
            <EmptyState
              currentFilter={filter}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onClearFilter={() => setFilter('All')}
            />
          ) : (
            <div className="task-list-card">
              <div className="task-table-header" aria-hidden="true">
                <div className="col-header col-title">TITLE</div>
                <div className="col-header col-desc">DESCRIPTION</div>
                <div className="col-header col-status">STATUS</div>
                <div className="col-header col-priority">PRIORITY</div>
                <div className="col-header col-date">CREATED</div>
                <div className="col-header col-actions"></div>
              </div>

              <div className="task-table-body">
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={updateTaskStatus}
                    onDeleteClick={(t) => setTaskToDelete(t)}
                    isUpdating={updatingTaskIds.has(task._id)}
                    isDeleting={deletingTaskIds.has(task._id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals & Toasts */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createTask}
        isSubmitting={isCreating}
      />

      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={!!taskToDelete && deletingTaskIds.has(taskToDelete._id)}
      />

      <NotificationToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
};
