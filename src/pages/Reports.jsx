import { GitBranch, Send } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StageTracker from '../components/StageTracker.jsx';
import { approvalItems, workflowStages } from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const columns = [
  { key: 'company', label: 'Company' },
  { key: 'stage', label: 'Current Stage' },
  { key: 'owner', label: 'Owner' },
  { key: 'priority', label: 'Priority' },
];

export default function Reports() {
  usePageTitle('Approval Workflow');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Approval Workflow"
        description="Track proposals across commercial, finance, SAP validation, hierarchy approval, quotation, conversion, and lost stages."
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            Submit approval <Send className="h-4 w-4" />
          </button>
        }
      />

      <section className="enterprise-card p-6">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-qpms-600" />
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Operational Approval Pipeline</h2>
        </div>
        <div className="mt-6">
          <StageTracker stages={workflowStages} currentStage="Finance Validation" />
        </div>
      </section>

      <DataTable columns={columns} rows={approvalItems} />
    </div>
  );
}
