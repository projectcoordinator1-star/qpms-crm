import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const defaultColumns = [
  { key: 'name', label: 'Name' },
  { key: 'owner', label: 'Owner' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'updated', label: 'Updated' },
];

export default function PageTemplate({ title, description, rows, columns = defaultColumns }) {
  usePageTitle(title);

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            <Plus className="h-4 w-4" /> New
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Active records', rows.length],
          ['Pending review', rows.filter((row) => row.status === 'Pending').length],
          ['Escalations', rows.filter((row) => row.status === 'Escalated').length],
        ].map(([label, value]) => (
          <div key={label} className="enterprise-card p-5">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
