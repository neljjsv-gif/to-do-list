import { useEffect, useMemo, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Menu, Plus } from 'lucide-react';
import { EmptyState } from './components/EmptyState';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import type {
  Task,
  TaskFilter,
  TaskFormInput,
  TaskSort,
  TaskSortField,
} from './types/task';
import {
  createTask,
  deleteTask,
  filterTasks,
  getTaskCounts,
  getTodayIso,
  loadTasksFromStorage,
  saveTasksToStorage,
  sortTasks,
  toggleTaskCompletion,
  updateTask,
} from './utils/taskLogic';

const VIEW_HEADINGS: Record<TaskFilter, string> = {
  all: 'All Tasks',
  active: 'Active Tasks',
  completed: 'Completed Tasks',
};

const MOBILE_TABS: Array<{ id: TaskFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadTasksFromStorage(window.localStorage);
  });

  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>({
    field: 'createdAt',
    direction: 'desc',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    saveTasksToStorage(window.localStorage, tasks);
  }, [tasks]);

  const todayIso = getTodayIso();
  const counts = useMemo(() => getTaskCounts(tasks), [tasks]);

  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(tasks, activeFilter);
    return sortTasks(filtered, sort);
  }, [tasks, activeFilter, sort]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (input: TaskFormInput) => {
    if (editingTask) {
      setTasks((prev) => updateTask(prev, editingTask.id, input));
    } else {
      setTasks((prev) => createTask(prev, input));
    }
    handleCloseModal();
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) => toggleTaskCompletion(prev, id));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => deleteTask(prev, id));
  };

  const handleSortFieldChange = (field: TaskSortField) => {
    setSort({
      field,
      direction: field === 'dueDate' ? 'asc' : 'desc',
    });
  };

  const handleToggleSortDirection = () => {
    setSort((prev) => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortDirectionLabel =
    sort.field === 'createdAt'
      ? sort.direction === 'desc'
        ? 'Newest first'
        : 'Oldest first'
      : sort.direction === 'asc'
        ? 'Soonest first'
        : 'Latest first';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        counts={counts}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Clean Top Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <h1 className="font-display truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {VIEW_HEADINGS[activeFilter]}
                </h1>
                <p
                  data-testid="pending-summary"
                  className="text-xs text-slate-500 tabular-nums sm:text-sm"
                >
                  {counts.active === 0
                    ? '0 pending tasks'
                    : counts.active === 1
                      ? '1 pending task'
                      : `${counts.active} pending tasks`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:h-10"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Add Task</span>
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {/* Toolbar: mobile quick filter tabs + sort controls */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Mobile / Tablet segmented filter tabs */}
            <div
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 lg:hidden"
              role="tablist"
              aria-label="Filter tasks"
            >
              {MOBILE_TABS.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}{' '}
                    <span className="font-mono tabular-nums opacity-75">
                      ({counts[tab.id]})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop view count summary */}
            <p className="hidden text-xs font-medium text-slate-500 tabular-nums lg:block">
              Showing {visibleTasks.length}{' '}
              {visibleTasks.length === 1 ? 'task' : 'tasks'}
            </p>

            {/* Sort controls */}
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-field-select"
                  className="text-xs font-medium text-slate-500 whitespace-nowrap"
                >
                  Sort by
                </label>
                <select
                  id="sort-field-select"
                  value={sort.field}
                  onChange={(e) =>
                    handleSortFieldChange(e.target.value as TaskSortField)
                  }
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="createdAt">Creation date</option>
                  <option value="dueDate">Due date</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleToggleSortDirection}
                aria-label={`Sort order: ${sortDirectionLabel}. Toggle sort direction`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {sort.direction === 'asc' ? (
                  <ArrowUpNarrowWide className="h-3.5 w-3.5 text-slate-500" />
                ) : (
                  <ArrowDownWideNarrow className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span>{sortDirectionLabel}</span>
              </button>
            </div>
          </div>

          {/* Task List Container (single-elevation white surface) */}
          <section
            aria-label="Task list"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            {visibleTasks.length === 0 ? (
              <EmptyState
                filter={activeFilter}
                totalTasks={tasks.length}
                onAddTask={handleOpenCreateModal}
                onSwitchFilter={setActiveFilter}
              />
            ) : (
              <ul
                data-testid="task-list"
                className="divide-y divide-slate-200/80"
              >
                {visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    todayIso={todayIso}
                    onToggle={handleToggleTask}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        editingTask={editingTask}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
      />
    </div>
  );
}
