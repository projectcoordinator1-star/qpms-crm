import {
  BarChart3,
  CheckSquare,
  ClipboardCheck,
  FileText,
  Home,
  ListChecks,
  MapPinned,
  Settings,
  Users,
  Workflow,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { isDemoMode } from '../config/demoMode.js';
import { useAuth } from '../context/auth-context.js';
import { isCoordinator, isExistingBusinessOperations, isFinanceTeam, isHrReviewer, isOperationsTeam } from '../data/mockUsers.js';
import { canAccessNavRoute } from '../utils/authRoles.js';
import Logo from './Logo.jsx';

const navGroups = [
  {
    title: 'Workspace',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: Home },
      { label: 'Lead Management', to: '/crm', icon: Workflow },
      { label: 'Site Visit & Estimation', to: '/sites', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Reviews',
    items: [
      { label: 'Review Workbench', to: '/tasks', icon: CheckSquare },
      { label: 'Approval Workflow', to: '/reports', icon: BarChart3, demoHidden: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Existing Business Operations', to: '/dashboard?workspace=operations', icon: ListChecks, existingOperationsOnly: true },
      { label: 'FO Activities', to: '/fo-activities', icon: MapPinned },
      { label: 'Tickets', to: '/tickets', icon: FileText, demoHidden: true },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'IAM', to: '/employees', icon: Users, demoHidden: true },
    ],
  },
];

function navLabelForRole(item, user) {
  if (item.to !== '/tasks') return item.label;
  if (isFinanceTeam(user)) return 'Finance Review';
  if (isHrReviewer(user)) return 'HR Review';
  if (isOperationsTeam(user)) return 'Operations Review';
  if (isCoordinator(user)) return 'Coordinator Review';
  return 'Commercial Review';
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const currentTarget = `${location.pathname}${location.search}`;
  const visibleNavGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const routePath = item.to.split('?')[0];
      if (item.existingOperationsOnly && !isExistingBusinessOperations(user)) return false;
      if (isDemoMode && item.demoHidden) return false;
      return canAccessNavRoute(user, routePath);
    }),
  })).filter((group) => group.items.length);

  const visibleNavItems = visibleNavGroups.flatMap((group) => group.items);
  const hasVisibleNav = visibleNavItems.length > 0;
  if (!hasVisibleNav) {
    visibleNavGroups.push({
      title: 'Admin',
      items: [{ label: 'Settings', to: '/settings', icon: Settings }],
    });
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-qpms-50/70 p-3 shadow-sm ring-1 ring-white/70 dark:border-slate-800 dark:from-slate-950 dark:to-qpms-900/10 dark:ring-white/5">
            <Logo className="h-10 w-10" />
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {visibleNavGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{group.title}</p>
              {group.items.map((item) => {
                const active = item.to.includes('?')
                  ? currentTarget === item.to
                  : location.pathname === item.to && !currentTarget.startsWith(`${item.to}?workspace=`);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={[
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                      active
                        ? 'bg-gradient-to-r from-qpms-700 to-qpms-500 text-white shadow-lg shadow-qpms-600/20'
                        : 'text-slate-600 hover:bg-qpms-50 hover:text-qpms-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white',
                    ].join(' ')}
                  >
                    <item.icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
                    <span>{navLabelForRole(item, user)}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
