import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Mail,
  Pencil,
  Plus,
  Save,
  Send,
  X,
} from 'lucide-react';
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

const initialLeadForm = {
  company: '',
  industry: '',
  source: '',
  location: '',
  state: '',
  city: '',
  contact: '',
  designation: '',
  phone: '',
  email: '',
  priority: '',
  remarks: '',
};

const industryOptions = ['Healthcare', 'Airport', 'Commercial', 'Retail', 'Hospitality', 'Education', 'Industrial'];
const sourceOptions = ['LinkedIn', 'Website', 'Campaign', 'Referral', 'Direct Visit', 'Email', 'Phone Enquiry'];
const stateOptions = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana', 'Andhra Pradesh - 1', 'Andhra Pradesh - 2'];
const priorityOptions = ['High', 'Medium', 'Low'];
const statusOptions = ['Active', 'Pending', 'Escalated', 'Completed'];
const executiveOptions = ['Unassigned', 'Ananya Rao', 'Karthik Menon', 'Nisha Iyer', 'Rahul Shah'];

function TextField({ label, value, onChange, type = 'text', required = false, multiline = false, disabled = false }) {
  const className =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:disabled:bg-slate-900';

  return (
    <label className="block">
      <span className="text-sm font-semibold leading-5 text-slate-700 dark:text-slate-300">{label}</span>
      {multiline ? (
        <textarea
          className={`${className} min-h-24 resize-none`}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          className={className}
          type={type}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
        />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false, disabled = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold leading-5 text-slate-700 dark:text-slate-300">{label}</span>
      <select
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:disabled:bg-slate-900"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
      <h3 className="text-sm font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function createTimeline(lead) {
  return [
    ...(lead.activity || []),
    `${lead.stage || 'Lead'} status reviewed`,
    'Lead record opened in desktop application',
  ];
}

function buildMomDraft(lead) {
  return {
    discussion:
      `Discussed initial facility management opportunity with ${lead.company || 'client'} contact ${lead.contact || 'the client contact'}. ` +
      `Lead source is ${lead.source || 'not specified'} and current status is ${lead.status || 'Active'}.`,
    actionItems:
      '1. Confirm client operating scope.\n2. Schedule decision-maker follow-up.\n3. Prepare for site survey readiness.',
    nextFollowUpDate: lead.followUp && lead.followUp !== 'Not scheduled' ? lead.followUp : '',
    remarks: lead.remarks || 'Lead MOM generated from desktop application.',
    sent: false,
  };
}

export default function CRM() {
  const [rows, setRows] = useState(leadRows);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [successMessage, setSuccessMessage] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [draftLead, setDraftLead] = useState(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [momDraft, setMomDraft] = useState(null);
  usePageTitle('Lead Management');

  const selectedLead = rows.find((row) => row.id === selectedLeadId);

  const stats = useMemo(
    () => [
      ['Business assigned', rows.filter((row) => row.executive && row.executive !== 'Unassigned').length],
      ['New leads', rows.filter((row) => row.stage === 'New Lead').length],
      ['Awaiting commercial', rows.filter((row) => row.stage === 'Commercial Review').length],
      ['Follow-ups due', rows.length + 22],
    ],
    [rows],
  );

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(''), 2600);
  }

  function addActivity(message, leadId = selectedLeadId) {
    const entry = `${message}`;
    setActivityLog((currentLog) => [entry, ...currentLog].slice(0, 4));
    if (leadId) {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === leadId ? { ...row, activity: [entry, ...(row.activity || [])].slice(0, 6) } : row,
        ),
      );
    }
  }

  function updateLeadForm(key, value) {
    setLeadForm((current) => ({ ...current, [key]: value }));
  }

  function updateDraftLead(key, value) {
    setDraftLead((current) => ({ ...current, [key]: value }));
  }

  function updateMomDraft(key, value) {
    setMomDraft((current) => ({ ...current, [key]: value }));
  }

  function closeForm() {
    setIsFormOpen(false);
    setLeadForm(initialLeadForm);
  }

  function closeLeadDrawer() {
    setSelectedLeadId(null);
    setDraftLead(null);
    setIsEditingLead(false);
    setMomDraft(null);
  }

  function openLeadDrawer(lead) {
    setSelectedLeadId(lead.id);
    setDraftLead({ ...lead });
    setIsEditingLead(false);
    setMomDraft(lead.mom || null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextLead = {
      id: Date.now(),
      company: leadForm.company,
      contact: leadForm.contact,
      source: leadForm.source,
      executive: 'Unassigned',
      stage: 'New Lead',
      followUp: 'Not scheduled',
      status: 'Active',
      industry: leadForm.industry,
      location: leadForm.location,
      state: leadForm.state,
      city: leadForm.city,
      designation: leadForm.designation,
      phone: leadForm.phone,
      email: leadForm.email,
      priority: leadForm.priority,
      remarks: leadForm.remarks,
      activity: ['New lead created from desktop application'],
    };

    setRows((currentRows) => [nextLead, ...currentRows]);
    setActivityLog((currentLog) => ['New lead created from desktop application', ...currentLog].slice(0, 4));
    showSuccess('Lead created successfully');
    closeForm();
  }

  function saveLeadChanges() {
    setRows((currentRows) => currentRows.map((row) => (row.id === selectedLeadId ? { ...row, ...draftLead } : row)));
    setIsEditingLead(false);
    addActivity('Lead details updated from desktop application');
    showSuccess('Lead updated successfully');
  }

  function generateMom() {
    const nextMom = buildMomDraft(draftLead || selectedLead);
    setMomDraft(nextMom);
    setDraftLead((current) => ({ ...current, stage: 'Lead MOM Created', mom: nextMom }));
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === selectedLeadId ? { ...row, stage: 'Lead MOM Created', mom: nextMom } : row,
      ),
    );
    addActivity('Lead MOM generated from lead details');
    showSuccess('Lead MOM generated');
  }

  function sendMom() {
    const nextMom = { ...momDraft, sent: true };
    setMomDraft(nextMom);
    setDraftLead((current) => ({ ...current, mom: nextMom }));
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === selectedLeadId ? { ...row, mom: nextMom } : row)),
    );
    addActivity('Lead MOM sent to client contact');
    showSuccess('Lead MOM sent successfully');
  }

  function convertToSiteVisit() {
    setDraftLead((current) => ({ ...current, stage: 'Site Visit Planned', status: 'Active' }));
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === selectedLeadId ? { ...row, stage: 'Site Visit Planned', status: 'Active' } : row,
      ),
    );
    addActivity('Lead converted to Site Visit & Estimation workflow');
    showSuccess('Lead moved to Site Visit & Estimation');
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Lead Management"
        description="Track QPMS business opportunities from first contact through site visit, commercial review, approvals, and proposal closure."
        actions={
          <div className="flex flex-wrap gap-3">
            <button className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold leading-5 text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white">
              Export list <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700"
            >
              New lead <Plus className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {successMessage ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
          {successMessage}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="enterprise-card p-5">
            <p className="text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold leading-none text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </section>

      {activityLog.length ? (
        <section className="enterprise-card p-5">
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Recent lead activity</h2>
          <div className="mt-4 space-y-2">
            {activityLog.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 dark:bg-slate-950/55 dark:text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <DataTable columns={columns} rows={rows} onRowClick={openLeadDrawer} />

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/70 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-semibold leading-tight text-slate-950 dark:text-white">Add New Lead</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Capture the initial lead details from desktop. Site visit and estimation requirements are handled in the next workflow stage.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
                aria-label="Close add lead form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <FormSection title="Client Details">
                <TextField label="Client / Company Name" value={leadForm.company} onChange={(value) => updateLeadForm('company', value)} required />
                <SelectField label="Industry Type" value={leadForm.industry} onChange={(value) => updateLeadForm('industry', value)} options={industryOptions} required />
                <TextField label="Site Location" value={leadForm.location} onChange={(value) => updateLeadForm('location', value)} required />
                <SelectField label="State" value={leadForm.state} onChange={(value) => updateLeadForm('state', value)} options={stateOptions} required />
                <TextField label="City" value={leadForm.city} onChange={(value) => updateLeadForm('city', value)} required />
              </FormSection>

              <FormSection title="Contact Details">
                <TextField label="Contact Person Name" value={leadForm.contact} onChange={(value) => updateLeadForm('contact', value)} required />
                <TextField label="Contact Person Designation" value={leadForm.designation} onChange={(value) => updateLeadForm('designation', value)} />
                <TextField label="Contact Number" type="tel" value={leadForm.phone} onChange={(value) => updateLeadForm('phone', value)} required />
                <TextField label="Email ID" type="email" value={leadForm.email} onChange={(value) => updateLeadForm('email', value)} />
              </FormSection>

              <FormSection title="Lead Information">
                <SelectField label="Lead Source" value={leadForm.source} onChange={(value) => updateLeadForm('source', value)} options={sourceOptions} required />
                <SelectField label="Lead Priority" value={leadForm.priority} onChange={(value) => updateLeadForm('priority', value)} options={priorityOptions} required />
                <div className="md:col-span-2">
                  <TextField label="Remarks" value={leadForm.remarks} onChange={(value) => updateLeadForm('remarks', value)} multiline />
                </div>
              </FormSection>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="focus-ring rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="focus-ring rounded-xl bg-qpms-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-qpms-600/20 transition hover:bg-qpms-700"
                >
                  Create lead
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedLead && draftLead ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm">
          <aside className="h-full w-full max-w-4xl overflow-y-auto border-l border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-qpms-600 dark:text-qpms-300">Lead Detail</p>
                  <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-950 dark:text-white">{selectedLead.company}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Lead to MOM to site survey workflow for QPMS business lifecycle.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeLeadDrawer}
                  className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Close lead detail"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingLead(true)}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  <Pencil className="h-4 w-4" /> Edit Lead
                </button>
                <button
                  type="button"
                  onClick={saveLeadChanges}
                  disabled={!isEditingLead}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-qpms-600/20 transition hover:bg-qpms-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
                <button
                  type="button"
                  onClick={generateMom}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  <FileText className="h-4 w-4" /> Generate Lead MOM
                </button>
                <button
                  type="button"
                  onClick={sendMom}
                  disabled={!momDraft}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4" /> Send Lead MOM
                </button>
                <button
                  type="button"
                  onClick={convertToSiteVisit}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  <ArrowRight className="h-4 w-4" /> Convert to Site Visit & Estimation
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 md:grid-cols-5">
                {['Lead', 'Lead MOM', 'Lead Confirmed', 'Site Survey / Assessment', 'Commercial Review'].map((stage, index) => (
                  <div key={stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/55">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Step {index + 1}</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{stage}</p>
                  </div>
                ))}
              </div>

              <FormSection title="Client Details">
                <TextField label="Client / Company Name" value={draftLead.company} onChange={(value) => updateDraftLead('company', value)} disabled={!isEditingLead} />
                <SelectField label="Industry Type" value={draftLead.industry} onChange={(value) => updateDraftLead('industry', value)} options={industryOptions} disabled={!isEditingLead} />
                <TextField label="Site Location" value={draftLead.location} onChange={(value) => updateDraftLead('location', value)} disabled={!isEditingLead} />
                <SelectField label="State" value={draftLead.state} onChange={(value) => updateDraftLead('state', value)} options={stateOptions} disabled={!isEditingLead} />
                <TextField label="City" value={draftLead.city} onChange={(value) => updateDraftLead('city', value)} disabled={!isEditingLead} />
              </FormSection>

              <FormSection title="Contact Details">
                <TextField label="Contact Person Name" value={draftLead.contact} onChange={(value) => updateDraftLead('contact', value)} disabled={!isEditingLead} />
                <TextField label="Contact Person Designation" value={draftLead.designation} onChange={(value) => updateDraftLead('designation', value)} disabled={!isEditingLead} />
                <TextField label="Contact Number" value={draftLead.phone} onChange={(value) => updateDraftLead('phone', value)} disabled={!isEditingLead} />
                <TextField label="Email ID" type="email" value={draftLead.email} onChange={(value) => updateDraftLead('email', value)} disabled={!isEditingLead} />
              </FormSection>

              <FormSection title="Lead Information">
                <SelectField label="Lead Source" value={draftLead.source} onChange={(value) => updateDraftLead('source', value)} options={sourceOptions} disabled={!isEditingLead} />
                <SelectField label="Assigned Executive" value={draftLead.executive} onChange={(value) => updateDraftLead('executive', value)} options={executiveOptions} disabled={!isEditingLead} />
                <SelectField label="Lead Status" value={draftLead.status} onChange={(value) => updateDraftLead('status', value)} options={statusOptions} disabled={!isEditingLead} />
                <SelectField label="Lead Priority" value={draftLead.priority} onChange={(value) => updateDraftLead('priority', value)} options={priorityOptions} disabled={!isEditingLead} />
                <TextField label="Lead Stage" value={draftLead.stage} onChange={(value) => updateDraftLead('stage', value)} disabled={!isEditingLead} />
                <TextField label="Next Follow-up" value={draftLead.followUp} onChange={(value) => updateDraftLead('followUp', value)} disabled={!isEditingLead} />
                <div className="md:col-span-2">
                  <TextField label="Remarks" value={draftLead.remarks} onChange={(value) => updateDraftLead('remarks', value)} multiline disabled={!isEditingLead} />
                </div>
              </FormSection>

              <section className="enterprise-card p-5">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-qpms-600" />
                  <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Lead MOM Preview</h3>
                </div>
                {momDraft ? (
                  <div className="mt-5 grid gap-4">
                    <TextField label="Discussion Summary" value={momDraft.discussion} onChange={(value) => updateMomDraft('discussion', value)} multiline />
                    <TextField label="Action Items" value={momDraft.actionItems} onChange={(value) => updateMomDraft('actionItems', value)} multiline />
                    <TextField label="Next Follow-up Date" value={momDraft.nextFollowUpDate} onChange={(value) => updateMomDraft('nextFollowUpDate', value)} />
                    <TextField label="Remarks" value={momDraft.remarks} onChange={(value) => updateMomDraft('remarks', value)} multiline />
                    <button
                      type="button"
                      onClick={sendMom}
                      className="focus-ring inline-flex w-fit items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700"
                    >
                      <Send className="h-4 w-4" /> Send MOM
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-950/55">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No MOM generated yet</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use Generate Lead MOM to create an editable meeting note from this lead.</p>
                  </div>
                )}
              </section>

              <section className="enterprise-card p-5">
                <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Activity Timeline</h3>
                <div className="mt-4 space-y-3">
                  {createTimeline(selectedLead).map((item, index) => (
                    <div key={`${item}-${index}`} className="flex gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-qpms-500" />
                      <p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
