import { LockKeyhole, UserCog } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { roleMatrix } from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const columns = [
  { key: 'role', label: 'Role' },
  { key: 'access', label: 'Access Foundation' },
  { key: 'users', label: 'Mock Users' },
];

export default function Employees() {
  usePageTitle('Employee IAM');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Employee / IAM Foundation"
        description="Mock role structure for future sidebar visibility, approvals, permissions, and operational workflow ownership."
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            Configure roles <UserCog className="h-4 w-4" />
          </button>
        }
      />

      <section className="enterprise-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-qpms-50 p-3 text-qpms-600">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Role-based access ready</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Sidebar items are structured as workflow modules now, so role-based visibility can be added later for MD, COO, GM,
              Branch Head, Business Team, Operations, and Supervisor users.
            </p>
          </div>
        </div>
      </section>

      <DataTable columns={columns} rows={roleMatrix} />
    </div>
  );
}
