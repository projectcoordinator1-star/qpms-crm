import { Camera, ClipboardCheck, Save } from 'lucide-react';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StageTracker from '../components/StageTracker.jsx';
import { siteVisitDraft, workflowStages } from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Sites() {
  usePageTitle('Site Visit & Estimation');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Site Visit & Estimation"
        description="Capture facility scope, housekeeping and security requirements, equipment, consumables, notes, and photos before MOM drafting."
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            Save estimate <Save className="h-4 w-4" />
          </button>
        }
      />

      <section className="enterprise-card p-6">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-qpms-600" />
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950">{siteVisitDraft.company}</h2>
        </div>
        <div className="mt-6">
          <StageTracker stages={workflowStages} currentStage="Submitted" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="enterprise-card p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Floors" value={siteVisitDraft.floors} />
            <FormField label="Area / Sqft" value={siteVisitDraft.area} />
            <FormField label="HK Requirement" value={siteVisitDraft.housekeeping} />
            <FormField label="Security Requirement" value={siteVisitDraft.security} />
            <FormField label="Equipment Requirement" value={siteVisitDraft.equipment} />
            <FormField label="Consumables" value={siteVisitDraft.consumables} />
            <div className="md:col-span-2">
              <FormField label="Special Notes" value={siteVisitDraft.notes} multiline />
            </div>
          </div>
        </div>

        <div className="enterprise-card p-6">
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Photos placeholder</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Future uploads from site visits can be attached here.</p>
          <div className="mt-5 grid gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <Camera className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
