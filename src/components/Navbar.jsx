import { Bell, Menu, Search, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/auth-context.js';
import Logo from './Logo.jsx';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const displayName = user?.name || 'Admin';
  const role = user?.role || 'Admin';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-600 shadow-sm lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden xl:block">
          <Logo className="h-8 w-8" textClassName="[&_p]:text-xs" />
        </div>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search leads, sites, approvals, employees..."
            className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white"
          />
        </div>

        <button
          type="button"
          className="focus-ring hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:text-slate-950 sm:inline-flex"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="focus-ring relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:text-slate-950"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 shadow-sm">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-qpms-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-bold leading-5 text-slate-950">{displayName}</p>
            <p className="truncate text-xs font-medium leading-4 text-slate-500">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
