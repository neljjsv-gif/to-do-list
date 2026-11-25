export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: number;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export type TaskSortField = 'createdAt' | 'dueDate';

export type SortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  direction: SortDirection;
}

export interface TaskFormInput {
  title: string;
  description?: string;
  dueDate?: string | null;
}

export interface TaskValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    description?: string;
    dueDate?: string;
  };
  sanitized: {
    title: string;
    description: string;
    dueDate: string | null;
  };
}

export type DueDateStatus = 'overdue' | 'today' | 'upcoming' | 'none';

export interface TaskCounts {
  all: number;
  active: number;
  completed: number;
}
