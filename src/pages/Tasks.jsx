import { CheckCircle2, MessageSquareText } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { commercialReviews } from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const columns = [
  { key: 'account', label: 'Account' },
  { key: 'manpower', label: 'Manpower Review' },
  { key: 'costing', label: 'Costing Review' },
  { key: 'remarks', label: 'Remarks', wrap: true },
  { key: 'status', label: 'Approval Status', render: (row) => <StatusBadge status={row.status} /> },
];

export default function Tasks() {
  usePageTitle('Commercial Review');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Commercial Review"
        description="Review manpower loading, costing assumptions, remarks, and commercial approval status before finance validation."
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            Add remarks <MessageSquareText className="h-4 w-4" />
          </button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Manpower reviews', '12'],
          ['Costing revisions', '5'],
          ['Ready for finance', '6'],
        ].map(([label, value]) => (
          <div key={label} className="enterprise-card flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium leading-5 text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold leading-none text-slate-950">{value}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        ))}
      </section>

      <DataTable columns={columns} rows={commercialReviews} />
    </div>
  );
}
