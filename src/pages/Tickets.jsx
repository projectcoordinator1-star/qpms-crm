import { FileText, Wand2 } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { siteVisitDraft } from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Tickets() {
  usePageTitle('MOM Draft');

  return (
    <div className="space-y-7">
      <PageHeader
        title="MOM Draft"
        description="Preview a meeting note generated from site visit and estimation data before it moves into commercial review."
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            Generate draft <Wand2 className="h-4 w-4" />
          </button>
        }
      />

      <section className="enterprise-card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-qpms-600" />
            <h2 className="text-[17px] font-semibold leading-6 text-slate-950">MOM preview</h2>
          </div>
        </div>
        <div className="space-y-5 p-6 text-sm leading-7 text-slate-700">
          <p>
            Site visit completed for <strong>{siteVisitDraft.company}</strong>. The facility scope includes{' '}
            <strong>{siteVisitDraft.floors} floors</strong> covering <strong>{siteVisitDraft.area}</strong>.
          </p>
          <p>
            Housekeeping requirement is estimated at <strong>{siteVisitDraft.housekeeping}</strong>. Security requirement is{' '}
            <strong>{siteVisitDraft.security}</strong>.
          </p>
          <p>
            Equipment requested: <strong>{siteVisitDraft.equipment}</strong>. Consumables plan: <strong>{siteVisitDraft.consumables}</strong>.
          </p>
          <p>
            Notes: <strong>{siteVisitDraft.notes}</strong>
          </p>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            Next action: send manpower and costing assumptions to commercial review.
          </div>
        </div>
      </section>
    </div>
  );
}
