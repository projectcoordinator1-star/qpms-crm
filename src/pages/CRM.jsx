import { ArrowUpRight, Plus } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { leadRows } from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const columns = [
  { key: 'company', label: 'Company Name' },
  { key: 'contact', label: 'Contact Person' },
  { key: 'source', label: 'Lead Source' },
  { key: 'executive', label: 'Assigned Business Executive' },
  { key: 'stage', label: 'Lead Stage' },
  { key: 'followUp', label: 'Next Follow-up' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

export default function CRM() {
  usePageTitle('Lead Management');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Lead Management"
        description="Track QPMS business opportunities from first contact through site visit, commercial review, approvals, and proposal closure."
        actions={
          <div className="flex flex-wrap gap-3">
            <button className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold leading-5 text-slate-700 shadow-sm hover:text-slate-950">
              Export list <ArrowUpRight className="h-4 w-4" />
            </button>
            <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
              New lead <Plus className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Business assigned', '31'],
          ['Site visits this week', '16'],
          ['Awaiting commercial', '11'],
          ['Follow-ups due', '27'],
        ].map(([label, value]) => (
          <div key={label} className="enterprise-card p-5">
            <p className="text-sm font-medium leading-5 text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold leading-none text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <DataTable columns={columns} rows={leadRows} />
    </div>
  );
}
