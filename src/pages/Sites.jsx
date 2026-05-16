import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, ClipboardCheck, FileText, Save, Search, Send, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StageTracker from '../components/StageTracker.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useWorkflow } from '../context/workflow-context.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const siteVisitColumns = [
  { key: 'company', label: 'Client / Company' },
  { key: 'scheduledVisitDate', label: 'Scheduled Visit Date', render: (row) => formatDate(row.scheduledVisitDate) },
  { key: 'scheduledVisitTime', label: 'Scheduled Visit Time', render: (row) => formatTime(row.scheduledVisitTime) },
  { key: 'executive', label: 'Assigned BD Executive' },
  { key: 'momStatus', label: 'Site MOM Status', render: (row) => <StatusBadge status={row.momStatus || 'Pending'} /> },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'location', label: 'Site Location', wrap: true },
  { key: 'contact', label: 'Contact Person' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const workflowStages = ['Site Visit Scheduled', 'Site Survey / Assessment', 'Site Visit MOM', 'Commercial Review', 'Finance Review', 'BD Team Review', 'COO Approval'];

const surveySections = [
  {
    title: 'Basic Site Information',
    fields: [
      ['siteAddress', 'Site Address'],
      ['siteType', 'Site Type'],
      ['operatingHours', 'Operating Hours'],
    ],
  },
  {
    title: 'Scope of IFM Services',
    fields: [['ifmScope', 'IFM Service Scope', true]],
  },
  {
    title: 'Hard Services',
    fields: [['hardServices', 'Electrical, Plumbing, HVAC and Technical Scope', true]],
  },
  {
    title: 'Soft Services',
    fields: [['softServices', 'Housekeeping, Security and Support Services', true]],
  },
  {
    title: 'Landscaping & Pest Control',
    fields: [
      ['landscaping', 'Landscaping Scope', true],
      ['pestControl', 'Pest Control Scope', true],
    ],
  },
  {
    title: 'HSE Compliance',
    fields: [['hseCompliance', 'HSE, PPE, Fire and Statutory Compliance Notes', true]],
  },
  {
    title: 'Manpower Requirement',
    fields: [['manpower', 'Shift-wise Manpower Requirement', true]],
  },
  {
    title: 'Tools / Equipment / Consumables',
    fields: [
      ['tools', 'Tools Requirement', true],
      ['equipment', 'Equipment Requirement', true],
      ['consumables', 'Consumables Requirement', true],
    ],
  },
  {
    title: 'Client KYC',
    fields: [['clientKyc', 'Client KYC / Billing / Document Notes', true]],
  },
  {
    title: 'Risk Assessment',
    fields: [['riskAssessment', 'Operational Risks and Mitigation', true]],
  },
  {
    title: 'Commercial Statement',
    fields: [['commercialStatement', 'Commercial Assumptions and Statement', true]],
  },
  {
    title: 'Approval Workflow',
    fields: [['approvalWorkflow', 'Internal Review and Approval Notes', true]],
  },
  {
    title: 'Final Remarks & Sign-Off',
    fields: [['finalRemarks', 'Final Remarks and Client Sign-Off Notes', true]],
  },
];

const photoSlots = ['Entrance', 'Service Area', 'Equipment Scope', 'HK Area', 'Electrical Room', 'Washroom', 'Fire Panel', 'Pump Room'];

function TextField({ label, value, onChange, multiline = false }) {
  const fieldClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium leading-5 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200';

  return (
    <label className="block">
      <span className="text-sm font-semibold leading-5 text-slate-700 dark:text-slate-300">{label}</span>
      {multiline ? (
        <textarea className={`${fieldClass} min-h-28 resize-none leading-6`} value={value || ''} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={fieldClass} value={value || ''} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
      <CheckCircle2 className="h-5 w-5" />
      {message}
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'Not scheduled';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(value) {
  if (!value) return 'Not scheduled';
  const [hourValue, minuteValue] = value.split(':');
  const date = new Date();
  date.setHours(Number(hourValue), Number(minuteValue || 0), 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function buildSiteVisitMom(visit, survey) {
  return {
    to: visit.email || '',
    cc: 'bdhead@qpms.in, commercial@qpms.in, operations@qpms.in',
    subject: `Site Visit MOM - ${visit.company} - QPMS`,
    summary: `Site survey assessment captured for ${visit.company} at ${visit.location || visit.city}.`,
    scope: survey.ifmScope || 'IFM service scope to be finalized from survey inputs.',
    requirements: [
      survey.hardServices,
      survey.softServices,
      survey.manpower,
      survey.tools,
      survey.equipment,
      survey.consumables,
    ].filter(Boolean).join('\n\n'),
    commercialNotes: survey.commercialStatement || 'Commercial review to validate manpower, equipment, consumables, and assumptions.',
    nextAction: 'Submit for Commercial Review',
    sent: false,
  };
}

export default function Sites() {
  const {
    siteVisits,
    saveSiteSurvey,
    saveSiteVisitMom,
    sendSiteVisitMom,
    submitCommercialReview,
  } = useWorkflow();
  const [query, setQuery] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [surveyDraft, setSurveyDraft] = useState(null);
  const [siteMomDraft, setSiteMomDraft] = useState(null);
  const [showMomPreview, setShowMomPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  usePageTitle('Site Visit & Estimation');

  const selectedVisit = siteVisits.find((visit) => visit.id === selectedVisitId);
  const activeSection = surveySections[activeSectionIndex];

  const filteredVisits = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return siteVisits;
    return siteVisits.filter((visit) =>
      [visit.company, visit.contact, visit.state, visit.city, visit.location, visit.status].some((item) =>
        String(item || '').toLowerCase().includes(value),
      ),
    );
  }, [query, siteVisits]);

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(''), 2600);
  }

  function openVisitDrawer(visit) {
    setSelectedVisitId(visit.id);
    setSurveyDraft({ ...(visit.survey || {}) });
    setSiteMomDraft(visit.siteMom || null);
    setActiveSectionIndex(0);
    setShowMomPreview(false);
  }

  function closeVisitDrawer() {
    setSelectedVisitId(null);
    setSurveyDraft(null);
    setSiteMomDraft(null);
    setShowMomPreview(false);
  }

  function updateSurveyDraft(key, value) {
    setSurveyDraft((current) => ({ ...current, [key]: value }));
  }

  function updateMomDraft(key, value) {
    setSiteMomDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveDraft() {
    saveSiteSurvey(selectedVisitId, surveyDraft);
    showSuccess('Site survey draft saved');
  }

  function handleGenerateMom() {
    saveSiteSurvey(selectedVisitId, surveyDraft);
    const nextMom = buildSiteVisitMom(selectedVisit, surveyDraft);
    setSiteMomDraft(nextMom);
    saveSiteVisitMom(selectedVisitId, nextMom);
    setShowMomPreview(true);
    showSuccess('Site Visit MOM generated');
  }

  function handleSendMom() {
    const nextMom = siteMomDraft || buildSiteVisitMom(selectedVisit, surveyDraft);
    sendSiteVisitMom(selectedVisitId, nextMom);
    setSiteMomDraft({ ...nextMom, sent: true });
    showSuccess('Site Visit MOM sent successfully');
  }

  function handleSubmitCommercialReview() {
    saveSiteSurvey(selectedVisitId, surveyDraft);
    submitCommercialReview(selectedVisitId);
    showSuccess('Submitted for Commercial Review');
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Site Visit & Estimation"
        description="Work only on leads where the Lead MOM has been sent, then capture the Site Survey Cum Assessment before commercial review."
      />

      <Toast message={successMessage} />

      <section className="enterprise-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Site Visit Queue</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Leads appear here after the Lead MOM is sent from Lead Management.
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search site visits..."
              className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="mt-5">
          {filteredVisits.length ? (
            <DataTable columns={siteVisitColumns} rows={filteredVisits} embedded onRowClick={openVisitDrawer} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-950/55">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No site visits ready yet</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Send a Lead MOM from Lead Management to move the lead into this workflow.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedVisit && surveyDraft ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm">
          <aside className="h-full w-full max-w-6xl overflow-y-auto border-l border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 p-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-qpms-600 dark:text-qpms-300">Site Survey Cum Assessment</p>
                  <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-950 dark:text-white">{selectedVisit.company}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {selectedVisit.contact} - {selectedVisit.city}, {selectedVisit.state}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeVisitDrawer}
                  className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Close site visit drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-5">
                <StageTracker stages={workflowStages} currentStage={selectedVisit.currentStage || 'Site Survey / Assessment'} />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Client Name', selectedVisit.company],
                  ['Site Name', selectedVisit.location || selectedVisit.company],
                  ['Scheduled Visit Date', formatDate(selectedVisit.scheduledVisitDate)],
                  ['Scheduled Visit Time', formatTime(selectedVisit.scheduledVisitTime)],
                  ['Assigned BD Executive', selectedVisit.executive || 'Unassigned'],
                  ['MOM Status', selectedVisit.momStatus || 'Pending'],
                  ['Current Stage', selectedVisit.currentStage || 'Site Survey / Assessment'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.32fr_0.68fr]">
              <section className="enterprise-card h-fit p-4">
                <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Survey Sections</h3>
                <div className="mt-4 space-y-2">
                  {surveySections.map((section, index) => (
                    <button
                      type="button"
                      key={section.title}
                      onClick={() => setActiveSectionIndex(index)}
                      className={[
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition',
                        activeSectionIndex === index
                          ? 'bg-qpms-600 text-white shadow-lg shadow-qpms-600/20'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                      ].join(' ')}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">{index + 1}</span>
                      {section.title}
                    </button>
                  ))}
                </div>
              </section>

              <div className="space-y-6">
                <section className="enterprise-card p-6">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-qpms-600" />
                    <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">{activeSection.title}</h3>
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {activeSection.fields.map(([key, label, multiline]) => (
                      <div key={key} className={multiline ? 'md:col-span-2' : ''}>
                        <TextField label={label} value={surveyDraft[key]} onChange={(value) => updateSurveyDraft(key, value)} multiline={multiline} />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="enterprise-card p-6">
                  <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Image Upload Placeholders</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Survey images can be attached here when backend storage is connected.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {photoSlots.map((slot) => (
                      <div key={slot} className="flex h-28 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-950/55">
                        <Camera className="h-5 w-5" />
                        <span className="mt-2 text-xs font-semibold">{slot}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {siteMomDraft ? (
                  <section className="enterprise-card p-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-qpms-600" />
                      <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Site Visit MOM Editor</h3>
                    </div>
                    <div className="mt-5 grid gap-4">
                      <TextField label="To" value={siteMomDraft.to} onChange={(value) => updateMomDraft('to', value)} />
                      <TextField label="CC" value={siteMomDraft.cc} onChange={(value) => updateMomDraft('cc', value)} />
                      <TextField label="Subject" value={siteMomDraft.subject} onChange={(value) => updateMomDraft('subject', value)} />
                      <TextField label="Summary" value={siteMomDraft.summary} onChange={(value) => updateMomDraft('summary', value)} multiline />
                      <TextField label="Scope" value={siteMomDraft.scope} onChange={(value) => updateMomDraft('scope', value)} multiline />
                      <TextField label="Requirements" value={siteMomDraft.requirements} onChange={(value) => updateMomDraft('requirements', value)} multiline />
                      <TextField label="Commercial Notes" value={siteMomDraft.commercialNotes} onChange={(value) => updateMomDraft('commercialNotes', value)} multiline />
                      <TextField label="Next Action" value={siteMomDraft.nextAction} onChange={(value) => updateMomDraft('nextAction', value)} />
                    </div>

                    {showMomPreview ? (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950/55 dark:text-slate-300">
                        <p className="font-bold text-slate-950 dark:text-white">{siteMomDraft.subject}</p>
                        <p className="mt-3 whitespace-pre-line">{siteMomDraft.summary}</p>
                        <p className="mt-3 whitespace-pre-line">{siteMomDraft.scope}</p>
                        <p className="mt-3 whitespace-pre-line">{siteMomDraft.requirements}</p>
                        <p className="mt-3 whitespace-pre-line">{siteMomDraft.commercialNotes}</p>
                        <p className="mt-3">Next action: {siteMomDraft.nextAction}</p>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                <section className="enterprise-card p-5">
                  <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Activity Timeline</h3>
                  <div className="mt-4 space-y-3">
                    {(selectedVisit.activity || []).map((item, index) => (
                      <div key={`${item}-${index}`} className="flex gap-3">
                        <div className="mt-2 h-2.5 w-2.5 rounded-full bg-qpms-500" />
                        <p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" onClick={handleSaveDraft} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white">
                  <Save className="h-4 w-4" /> Save Draft
                </button>
                <button type="button" onClick={handleGenerateMom} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white">
                  <FileText className="h-4 w-4" /> Generate Site Visit MOM
                </button>
                <button type="button" onClick={() => setShowMomPreview((value) => !value)} disabled={!siteMomDraft} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white">
                  <FileText className="h-4 w-4" /> Preview MOM
                </button>
                <button type="button" onClick={handleSendMom} disabled={!siteMomDraft} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700 disabled:cursor-not-allowed disabled:opacity-50">
                  <Send className="h-4 w-4" /> Send Site Visit MOM
                </button>
                <button type="button" onClick={handleSubmitCommercialReview} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                  Submit for Commercial Review
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
