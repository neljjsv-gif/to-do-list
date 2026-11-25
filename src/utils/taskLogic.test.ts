import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  createSeedTasks,
  createTask,
  deleteTask,
  filterTasks,
  formatDueDateLabel,
  getDueDateStatus,
  getTaskCounts,
  isValidIsoDate,
  loadTasksFromStorage,
  saveTasksToStorage,
  sortTasks,
  toggleTaskCompletion,
  updateTask,
  validateTaskInput,
  type StorageLike,
} from './taskLogic';
import type { Task } from '../types/task';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

test('validateTaskInput rejects empty or whitespace-only titles', () => {
  const empty = validateTaskInput({ title: '' });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.title);

  const spaces = validateTaskInput({ title: '   \t\n  ' });
  assert.equal(spaces.valid, false);
  assert.ok(spaces.errors.title);
});

test('validateTaskInput rejects invalid calendar dates and accepts valid ones', () => {
  assert.equal(isValidIsoDate('2026-02-30'), false);
  assert.equal(isValidIsoDate('2026-13-01'), false);
  assert.equal(isValidIsoDate('not-a-date'), false);
  assert.equal(isValidIsoDate('2026-11-25'), true);

  const badDate = validateTaskInput({ title: 'Book flight', dueDate: '2026-02-30' });
  assert.equal(badDate.valid, false);
  assert.ok(badDate.errors.dueDate);

  const valid = validateTaskInput({
    title: '  Write release notes  ',
    description: '  Include migration steps  ',
    dueDate: '2026-12-05',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized.title, 'Write release notes');
  assert.equal(valid.sanitized.description, 'Include migration steps');
  assert.equal(valid.sanitized.dueDate, '2026-12-05');
});

test('CRUD lifecycle: create, update, toggle completion, and delete', () => {
  let tasks: Task[] = [];
  tasks = createTask(
    tasks,
    { title: 'Buy groceries', description: 'Milk and coffee', dueDate: '2026-11-28' },
    { now: 1000, id: 't1' }
  );
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].completed, false);
  assert.equal(tasks[0].id, 't1');

  tasks = updateTask(tasks, 't1', {
    title: 'Buy organic groceries',
    description: '',
    dueDate: null,
  });
  assert.equal(tasks[0].title, 'Buy organic groceries');
  assert.equal(tasks[0].description, '');
  assert.equal(tasks[0].dueDate, null);

  tasks = toggleTaskCompletion(tasks, 't1');
  assert.equal(tasks[0].completed, true);

  tasks = deleteTask(tasks, 't1');
  assert.equal(tasks.length, 0);
});

test('filterTasks and getTaskCounts separate All, Active, and Completed accurately', () => {
  const sample: Task[] = [
    { id: '1', title: 'A', description: '', completed: false, dueDate: null, createdAt: 10 },
    { id: '2', title: 'B', description: '', completed: true, dueDate: null, createdAt: 20 },
    { id: '3', title: 'C', description: '', completed: false, dueDate: null, createdAt: 30 },
  ];

  assert.deepEqual(getTaskCounts(sample), { all: 3, active: 2, completed: 1 });
  assert.equal(filterTasks(sample, 'all').length, 3);
  assert.deepEqual(
    filterTasks(sample, 'active').map((t) => t.id),
    ['1', '3']
  );
  assert.deepEqual(
    filterTasks(sample, 'completed').map((t) => t.id),
    ['2']
  );
});

test('sortTasks orders by createdAt and dueDate with null due dates at the end', () => {
  const sample: Task[] = [
    { id: '1', title: 'No date', description: '', completed: false, dueDate: null, createdAt: 300 },
    { id: '2', title: 'Later', description: '', completed: false, dueDate: '2026-12-10', createdAt: 100 },
    { id: '3', title: 'Sooner', description: '', completed: false, dueDate: '2026-11-26', createdAt: 200 },
  ];

  assert.deepEqual(
    sortTasks(sample, { field: 'createdAt', direction: 'desc' }).map((t) => t.id),
    ['1', '3', '2']
  );
  assert.deepEqual(
    sortTasks(sample, { field: 'createdAt', direction: 'asc' }).map((t) => t.id),
    ['2', '3', '1']
  );
  assert.deepEqual(
    sortTasks(sample, { field: 'dueDate', direction: 'asc' }).map((t) => t.id),
    ['3', '2', '1']
  );
  assert.deepEqual(
    sortTasks(sample, { field: 'dueDate', direction: 'desc' }).map((t) => t.id),
    ['2', '3', '1']
  );
});

test('getDueDateStatus and formatDueDateLabel handle overdue, today, and upcoming dates', () => {
  const today = '2026-11-25';
  assert.equal(getDueDateStatus('2026-11-24', false, today), 'overdue');
  assert.equal(getDueDateStatus('2026-11-24', true, today), 'upcoming');
  assert.equal(getDueDateStatus('2026-11-25', false, today), 'today');
  assert.equal(getDueDateStatus('2026-11-26', false, today), 'upcoming');
  assert.equal(getDueDateStatus(null, false, today), 'none');

  assert.equal(formatDueDateLabel('2026-11-25', today), 'Today');
  assert.equal(formatDueDateLabel('2026-11-26', today), 'Tomorrow');
  assert.equal(formatDueDateLabel('2026-11-24', today), 'Yesterday');
  assert.equal(formatDueDateLabel('2026-12-03', today), 'Dec 3');
  assert.equal(formatDueDateLabel('2027-01-15', today), 'Jan 15, 2027');
});

test('LocalStorage persistence seeds on first visit, persists empty arrays, and recovers from invalid JSON', () => {
  const storage = createMemoryStorage();
  const initial = loadTasksFromStorage(storage);
  assert.equal(initial.length, createSeedTasks().length);

  // Saving an empty array must stay empty on reload (do not re-seed)
  saveTasksToStorage(storage, []);
  const afterClear = loadTasksFromStorage(storage);
  assert.equal(afterClear.length, 0);

  // Corrupted storage falls back safely to []
  storage.setItem(STORAGE_KEY, '{corrupted json');
  assert.deepEqual(loadTasksFromStorage(storage), []);
});
