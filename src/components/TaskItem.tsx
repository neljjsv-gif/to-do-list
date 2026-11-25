import { AlertCircle, Calendar, Check, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types/task';
import {
  formatCreatedDate,
  formatDueDateLabel,
  getDueDateStatus,
} from '../utils/taskLogic';

interface TaskItemProps {
  task: Task;
  todayIso: string;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({
  task,
  todayIso,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const dueStatus = getDueDateStatus(task.dueDate, task.completed, todayIso);
  const dueLabel = formatDueDateLabel(task.dueDate, todayIso);
  const createdLabel = formatCreatedDate(task.createdAt);

  return (
    <li
      data-testid={`task-item-${task.id}`}
      className="group flex items-start gap-3.5 px-4 py-4 transition-colors duration-150 hover:bg-slate-50/80 sm:px-6"
    >
      {/* Completion toggle button with generous accessible touch target */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={
          task.completed
            ? `Mark "${task.title}" as incomplete`
            : `Mark "${task.title}" as completed`
        }
        onClick={() => onToggle(task.id)}
        className="-ml-1.5 -mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
            task.completed
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400'
          }`}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
        </span>
      </button>

      {/* Main task content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`pt-0.5 text-[15px] font-medium leading-snug break-words transition-colors duration-150 ${
              task.completed
                ? 'text-slate-400 line-through decoration-slate-300'
                : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>

          {/* Edit & Delete actions */}
          <div className="-mr-1.5 -mt-1.5 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit "${task.title}"`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:h-10 sm:w-10"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete "${task.title}"`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:h-10 sm:w-10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {task.description && (
          <p
            className={`mt-1 text-sm leading-relaxed break-words ${
              task.completed ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Unboxed inline metadata row (zero pills) */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {dueLabel && (
            <>
              <span
                className={`inline-flex items-center gap-1 whitespace-nowrap font-medium tabular-nums ${
                  dueStatus === 'overdue'
                    ? 'text-red-600'
                    : dueStatus === 'today'
                      ? 'text-amber-700'
                      : task.completed
                        ? 'text-slate-400'
                        : 'text-slate-600'
                }`}
              >
                {dueStatus === 'overdue' ? (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {dueStatus === 'overdue' ? `Overdue · ${dueLabel}` : `Due ${dueLabel}`}
                </span>
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
            </>
          )}
          <span className="whitespace-nowrap text-slate-400 tabular-nums">
            Added {createdLabel}
          </span>
        </div>
      </div>
    </li>
  );
}
