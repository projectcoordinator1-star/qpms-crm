import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  ClipboardCheck,
  FileText,
  Home,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { isDemoMode } from '../config/demoMode.js';
import { useAuth } from '../context/auth-context.js';
import { isApprovalReviewer, isCoordinator, isFinanceTeam, isHrReviewer, isOperationsTeam } from '../data/mockUsers.js';
import { canAccessNavRoute } from '../utils/authRoles.js';
import Logo from './Logo.jsx';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Lead Management', to: '/crm', icon: Workflow },
  { label: 'Site Visit & Estimation', to: '/sites', icon: ClipboardCheck },
  { label: 'MOM Draft', to: '/tickets', icon: FileText, demoHidden: true },
  { label: 'Commercial Review', to: '/tasks', icon: CheckSquare },
  { label: 'Approval Workflow', to: '/reports', icon: BarChart3, demoHidden: true },
  { label: 'Employee IAM', to: '/employees', icon: Users, demoHidden: true },
  { label: 'Settings', to: '/settings', icon: Settings },
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
  const roleLabel = user?.role || 'Workflow User';
  const roleSection = ['Admin', 'COO'].includes(roleLabel)
    ? 'Management Console'
    : isApprovalReviewer(user)
      ? 'Reviewer Workspace'
      : ['BD Executive', 'BD Head'].includes(roleLabel)
        ? 'Business Development'
        : 'CRM Workspace';
  const visibleNavItems = navItems.filter((item) => {
    if (isDemoMode && item.demoHidden) return false;
    return canAccessNavRoute(user, item.to);
  });

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
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100 dark:bg-slate-950/70 dark:ring-slate-800">
              <BriefcaseBusiness className="h-4 w-4 text-qpms-600 dark:text-qpms-300" />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{roleSection}</p>
                <p className="truncate text-sm font-semibold leading-5 text-slate-950 dark:text-white">{roleLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Navigation</p>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-gradient-to-r from-qpms-700 to-qpms-500 text-white shadow-lg shadow-qpms-600/20'
                    : 'text-slate-600 hover:bg-qpms-50 hover:text-qpms-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white',
                ].join(' ')
              }
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
              <span>{navLabelForRole(item, user)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="m-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 text-qpms-600 shadow-sm ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Access Scope</p>
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{roleSection}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
