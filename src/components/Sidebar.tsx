import { CheckCircle2, Circle, Layers, X } from 'lucide-react';
import type { TaskCounts, TaskFilter } from '../types/task';

interface SidebarProps {
  activeFilter: TaskFilter;
  onSelectFilter: (filter: TaskFilter) => void;
  counts: TaskCounts;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: TaskFilter;
  label: string;
  icon: typeof Layers;
}> = [
  { id: 'all', label: 'All Tasks', icon: Layers },
  { id: 'active', label: 'Active Tasks', icon: Circle },
  { id: 'completed', label: 'Completed Tasks', icon: CheckCircle2 },
];

export function Sidebar({
  activeFilter,
  onSelectFilter,
  counts,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const handleSelect = (filter: TaskFilter) => {
    onSelectFilter(filter);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between px-4 py-6">
      <div>
        <div className="flex items-center justify-between px-2 pb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Cadence
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Task views" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.id;
            const count = counts[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isActive ? 'font-medium text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200/80 px-2 pt-4">
        <p className="text-xs text-slate-500 tabular-nums">
          {counts.active === 0
            ? 'No pending tasks'
            : counts.active === 1
              ? '1 pending task'
              : `${counts.active} pending tasks`}
        </p>
        <p className="mt-0.5 text-xs text-slate-400 tabular-nums">
          {counts.completed} of {counts.all} completed
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
