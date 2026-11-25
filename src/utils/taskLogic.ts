import type {
  DueDateStatus,
  Task,
  TaskCounts,
  TaskFilter,
  TaskFormInput,
  TaskSort,
  TaskValidationResult,
} from '../types/task';

export const STORAGE_KEY = 'cadence_tasks_v1';

export const MAX_TITLE_LENGTH = 140;
export const MAX_DESCRIPTION_LENGTH = 500;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getTodayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysIso(baseIso: string, offsetDays: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(baseIso);
  if (!match) return baseIso;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(year, month - 1, day + offsetDays);
  return getTodayIso(d);
}

export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) return false;
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

export function validateTaskInput(input: TaskFormInput): TaskValidationResult {
  const errors: TaskValidationResult['errors'] = {};
  const title = (input.title ?? '').trim();
  const description = (input.description ?? '').trim();
  const rawDueDate = (input.dueDate ?? '').trim();
  const dueDate = rawDueDate === '' ? null : rawDueDate;

  if (!title) {
    errors.title = 'Please enter a task title.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`;
  }

  if (dueDate !== null && !isValidIsoDate(dueDate)) {
    errors.dueDate = 'Please enter a valid date in YYYY-MM-DD format.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      title,
      description,
      dueDate,
    },
  };
}

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createTask(
  tasks: Task[],
  input: TaskFormInput,
  options: { now?: number; id?: string } = {}
): Task[] {
  const validation = validateTaskInput(input);
  if (!validation.valid) {
    throw new Error(
      validation.errors.title ||
        validation.errors.dueDate ||
        validation.errors.description ||
        'Invalid task input'
    );
  }

  const newTask: Task = {
    id: options.id ?? generateTaskId(),
    title: validation.sanitized.title,
    description: validation.sanitized.description,
    completed: false,
    dueDate: validation.sanitized.dueDate,
    createdAt: options.now ?? Date.now(),
  };

  return [newTask, ...tasks];
}

export function updateTask(
  tasks: Task[],
  id: string,
  input: TaskFormInput
): Task[] {
  const validation = validateTaskInput(input);
  if (!validation.valid) {
    throw new Error(
      validation.errors.title ||
        validation.errors.dueDate ||
        validation.errors.description ||
        'Invalid task input'
    );
  }

  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          title: validation.sanitized.title,
          description: validation.sanitized.description,
          dueDate: validation.sanitized.dueDate,
        }
      : task
  );
}

export function toggleTaskCompletion(tasks: Task[], id: string): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'active':
      return tasks.filter((t) => !t.completed);
    case 'completed':
      return tasks.filter((t) => t.completed);
    case 'all':
    default:
      return tasks;
  }
}

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks];
  copy.sort((a, b) => {
    if (sort.field === 'createdAt') {
      const diff = a.createdAt - b.createdAt;
      return sort.direction === 'asc' ? diff : -diff;
    }

    // Sort by dueDate: tasks without a dueDate always sink to the bottom
    if (a.dueDate === null && b.dueDate === null) {
      return b.createdAt - a.createdAt;
    }
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;

    const cmp = a.dueDate.localeCompare(b.dueDate);
    if (cmp !== 0) {
      return sort.direction === 'asc' ? cmp : -cmp;
    }
    return b.createdAt - a.createdAt;
  });
  return copy;
}

export function getTaskCounts(tasks: Task[]): TaskCounts {
  let active = 0;
  let completed = 0;
  for (const task of tasks) {
    if (task.completed) {
      completed += 1;
    } else {
      active += 1;
    }
  }
  return {
    all: tasks.length,
    active,
    completed,
  };
}

export function getDueDateStatus(
  dueDate: string | null,
  completed: boolean,
  todayIso: string = getTodayIso()
): DueDateStatus {
  if (!dueDate || !isValidIsoDate(dueDate)) return 'none';
  if (completed) return 'upcoming';
  if (dueDate < todayIso) return 'overdue';
  if (dueDate === todayIso) return 'today';
  return 'upcoming';
}

export function formatDueDateLabel(
  dueDate: string | null,
  todayIso: string = getTodayIso()
): string | null {
  if (!dueDate || !isValidIsoDate(dueDate)) return null;
  if (dueDate === todayIso) return 'Today';
  const tomorrowIso = addDaysIso(todayIso, 1);
  if (dueDate === tomorrowIso) return 'Tomorrow';
  const yesterdayIso = addDaysIso(todayIso, -1);
  if (dueDate === yesterdayIso) return 'Yesterday';

  const [, monthStr, dayStr] = dueDate.split('-');
  const year = Number(dueDate.slice(0, 4));
  const currentYear = Number(todayIso.slice(0, 4));
  const d = new Date(year, Number(monthStr) - 1, Number(dayStr));
  const monthName = d.toLocaleDateString('en-US', { month: 'short' });
  if (year === currentYear) {
    return `${monthName} ${Number(dayStr)}`;
  }
  return `${monthName} ${Number(dayStr)}, ${year}`;
}

export function formatCreatedDate(timestamp: number): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function createSeedTasks(now: number = Date.now(), todayIso: string = getTodayIso()): Task[] {
  return [
    {
      id: 'seed-1',
      title: 'Finalize quarterly product roadmap',
      description: 'Review engineering estimates and confirm Q4 release milestones with stakeholders.',
      completed: false,
      dueDate: todayIso,
      createdAt: now - 1000 * 60 * 60 * 5,
    },
    {
      id: 'seed-2',
      title: 'Audit design system spacing tokens',
      description: 'Ensure consistent hairline borders and responsive padding across mobile breakpoints.',
      completed: false,
      dueDate: addDaysIso(todayIso, 2),
      createdAt: now - 1000 * 60 * 60 * 24,
    },
    {
      id: 'seed-3',
      title: 'Prepare weekly team sync agenda',
      description: '',
      completed: false,
      dueDate: null,
      createdAt: now - 1000 * 60 * 60 * 30,
    },
    {
      id: 'seed-4',
      title: 'Send customer feedback summary',
      description: 'Compile top five onboarding requests from October interviews.',
      completed: true,
      dueDate: addDaysIso(todayIso, -1),
      createdAt: now - 1000 * 60 * 60 * 48,
    },
  ];
}

function sanitizeStoredTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== 'string' || !record.id.trim()) return null;
  if (typeof record.title !== 'string' || !record.title.trim()) return null;

  const description =
    typeof record.description === 'string' ? record.description.slice(0, MAX_DESCRIPTION_LENGTH) : '';
  const completed = Boolean(record.completed);
  const dueDate =
    typeof record.dueDate === 'string' && isValidIsoDate(record.dueDate)
      ? record.dueDate
      : null;
  const createdAt =
    typeof record.createdAt === 'number' && Number.isFinite(record.createdAt)
      ? record.createdAt
      : Date.now();

  return {
    id: record.id,
    title: record.title.trim().slice(0, MAX_TITLE_LENGTH),
    description: description.trim(),
    completed,
    dueDate,
    createdAt,
  };
}

export function loadTasksFromStorage(storage: StorageLike | null | undefined): Task[] {
  if (!storage) {
    return createSeedTasks();
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      const seeds = createSeedTasks();
      storage.setItem(STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(sanitizeStoredTask)
      .filter((t): t is Task => t !== null);
  } catch {
    return [];
  }
}

export function saveTasksToStorage(
  storage: StorageLike | null | undefined,
  tasks: Task[]
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}
