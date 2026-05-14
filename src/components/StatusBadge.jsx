export default function StatusBadge({ status }) {
  const classes = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25',
    'In Transit': 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/25',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25',
    Offline: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700/55 dark:text-slate-300 dark:ring-slate-600',
    Critical: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/25',
    Escalated: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/25',
    Completed: 'bg-qpms-50 text-qpms-700 ring-qpms-200 dark:bg-qpms-500/15 dark:text-qpms-300 dark:ring-qpms-500/25',
    Healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25',
    Warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25',
    Open: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/25',
  };

  return (
    <span
      className={`inline-flex self-start rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${classes[status] || classes.Open}`}
    >
      {status}
    </span>
  );
}
