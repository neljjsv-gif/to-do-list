import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskFormInput } from '../types/task';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  validateTaskInput,
} from '../utils/taskLogic';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSave: (input: TaskFormInput) => void;
}

export function TaskModal({
  isOpen,
  editingTask,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    dueDate?: string;
  }>({});

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(editingTask?.title ?? '');
      setDescription(editingTask?.description ?? '');
      setDueDate(editingTask?.dueDate ?? '');
      setErrors({});
      // Focus title input cleanly on open
      requestAnimationFrame(() => {
        titleInputRef.current?.focus();
      });
    }
  }, [isOpen, editingTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(editingTask);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateTaskInput({
      title,
      description,
      dueDate: dueDate || null,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      if (validation.errors.title) {
        titleInputRef.current?.focus();
      }
      return;
    }

    onSave(validation.sanitized);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
          <h2
            id="task-modal-title"
            className="font-display text-lg font-semibold text-slate-900"
          >
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
          <div>
            <label
              htmlFor="task-title-input"
              className="block text-sm font-medium text-slate-700"
            >
              Task Title <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="task-title-input"
              type="text"
              value={title}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              placeholder="e.g., Prepare Q4 product roadmap"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
              }`}
            />
            {errors.title && (
              <p
                id="task-title-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-description-input"
                className="block text-sm font-medium text-slate-700"
              >
                Description <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              id="task-description-input"
              rows={3}
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              placeholder="Add helpful context, links, or notes..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'task-description-error' : undefined
              }
              className="mt-1.5 block w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            {errors.description && (
              <p
                id="task-description-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-due-date-input"
                className="block text-sm font-medium text-slate-700"
              >
                Due Date <span className="font-normal text-slate-400">(optional)</span>
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => {
                    setDueDate('');
                    if (errors.dueDate) {
                      setErrors((prev) => ({ ...prev, dueDate: undefined }));
                    }
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Clear date
                </button>
              )}
            </div>
            <input
              id="task-due-date-input"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) {
                  setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? 'task-due-date-error' : undefined}
              className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.dueDate
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
              }`}
            />
            {errors.dueDate && (
              <p
                id="task-due-date-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.dueDate}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
