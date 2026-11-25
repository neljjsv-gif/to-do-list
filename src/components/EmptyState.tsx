import { CheckCircle2, Inbox, ListChecks, Plus } from 'lucide-react';
import type { TaskFilter } from '../types/task';

interface EmptyStateProps {
  filter: TaskFilter;
  totalTasks: number;
  onAddTask: () => void;
  onSwitchFilter: (filter: TaskFilter) => void;
}

export function EmptyState({
  filter,
  totalTasks,
  onAddTask,
  onSwitchFilter,
}: EmptyStateProps) {
  if (filter === 'active' && totalTasks > 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-base font-semibold text-slate-900">
          All caught up
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          Every task on your list is marked complete. Add a new task or review what you finished.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchFilter('completed')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            View Completed
          </button>
        </div>
      </div>
    );
  }

  if (filter === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <ListChecks className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-base font-semibold text-slate-900">
          No completed tasks yet
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          Check off a task when you finish it and it will show up here for reference.
        </p>
        {totalTasks > 0 && (
          <button
            type="button"
            onClick={() => onSwitchFilter('active')}
            className="mt-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            View Active Tasks
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Inbox className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-display text-base font-semibold text-slate-900">
        No tasks yet
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Start organizing your day by adding your first task with an optional description and due date.
      </p>
      <button
        type="button"
        onClick={onAddTask}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <Plus className="h-4 w-4" />
        <span>Add First Task</span>
      </button>
    </div>
  );
}
