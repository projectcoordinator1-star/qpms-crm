import {
  BarChart3,
  CheckSquare,
  ClipboardCheck,
  FileText,
  Home,
  LifeBuoy,
  Settings,
  Users,
  Workflow,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth-context.js';
import { canManageLeads, isApprovalReviewer } from '../data/mockUsers.js';
import Logo from './Logo.jsx';

const navItems = [
  { label: 'DashboardE', to: '/dashboard', icon: Home },
  { label: 'Lead Management', to: '/crm', icon: Workflow },
  { label: 'Site Visit & Estimation', to: '/sites', icon: ClipboardCheck },
  { label: 'MOM Draft', to: '/tickets', icon: FileText },
  { label: 'Commercial Review', to: '/tasks', icon: CheckSquare },
  { label: 'Approval Workflow', to: '/reports', icon: BarChart3 },
  { label: 'Employee IAM', to: '/employees', icon: Users },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const visibleNavItems = navItems.filter((item) => {
    if (user?.role === 'Admin') return true;
    if (['BD Executive', 'BD Head'].includes(user?.role)) return ['/dashboard', '/crm', '/sites', '/settings'].includes(item.to);
    if (isApprovalReviewer(user)) return ['/dashboard', '/tasks', '/reports', '/sites', '/settings'].includes(item.to);
    if (!canManageLeads(user) && item.to === '/crm') return false;
    return true;
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
        <div className="flex h-20 items-center border-b border-slate-100 px-6 dark:border-slate-800">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-qpms-50 text-qpms-700 shadow-[inset_0_0_0_1px_rgba(36,68,164,0.08)] dark:bg-qpms-500/15 dark:text-qpms-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white',
                ].join(' ')
              }
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="m-4 rounded-2xl border border-qpms-100 bg-qpms-50 p-4 dark:border-qpms-500/20 dark:bg-qpms-500/10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-qpms-600 shadow-sm">
              <LifeBuoy className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">Need help?</p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Navigation is filtered by your current workflow role.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
