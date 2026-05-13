export default function StatusBadge({ status }) {
  const classes = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    Escalated: 'bg-rose-50 text-rose-700 ring-rose-200',
    Completed: 'bg-qpms-50 text-qpms-700 ring-qpms-200',
    Open: 'bg-sky-50 text-sky-700 ring-sky-200',
  };

  return (
    <span
      className={`inline-flex self-start rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${classes[status] || classes.Open}`}
    >
      {status}
    </span>
  );
}
