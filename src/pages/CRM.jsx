import { useMemo, useState } from 'react';
import { CheckCircle2, FileText, Mail, Pencil, Plus, Save, Send, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useWorkflow } from '../context/workflow-context.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const leadColumns = [
  { key: 'leadId', label: 'Lead ID' },
  { key: 'company', label: 'Company Name' },
  { key: 'contact', label: 'Contact Person' },
  { key: 'source', label: 'Lead Source' },
  { key: 'executive', label: 'Assigned BD Executive' },
  { key: 'stage', label: 'Lead Stage' },
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

const initialMomDraft = {
  to: '',
  cc: 'bdhead@qpms.in, coo@qpms.in',
  subject: '',
  discussionSummary: '',
  serviceScopeDiscussion: '',
  actionItems: '',
  nextFollowUpDate: '',
  remarks: '',
  sent: false,
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
          className={`${className} min-h-24 resize-none leading-6`}
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

function createLeadMomDraft(lead) {
  return {
    ...initialMomDraft,
    to: lead.email || '',
    subject: `Lead MOM - ${lead.company || 'Client'} - QPMS`,
    discussionSummary: `Initial discussion completed with ${lead.contact || 'client contact'} for ${lead.company || 'the client'} regarding QPMS facility management support.`,
    serviceScopeDiscussion: 'Facility management, housekeeping operations, site management, and related operational support were discussed at a high level.',
    actionItems: '1. Confirm decision-maker availability.\n2. Share site visit readiness details.\n3. Schedule site survey with QPMS team.',
    nextFollowUpDate: lead.followUp === 'Not scheduled' ? '' : lead.followUp || '',
    remarks: lead.remarks || 'Lead MOM prepared from desktop application.',
  };
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

export default function CRM() {
  const { leads, addLead, updateLead, saveLeadMomDraft, sendLeadMom } = useWorkflow();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [draftLead, setDraftLead] = useState(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [isMomOpen, setIsMomOpen] = useState(false);
  const [momDraft, setMomDraft] = useState(initialMomDraft);
  const [showMomPreview, setShowMomPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  usePageTitle('Lead Management');

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId);

  const stats = useMemo(
    () => [
      ['Total leads', leads.length],
      ['New leads', leads.filter((lead) => lead.stage === 'New Lead').length],
      ['MOM sent', leads.filter((lead) => lead.stage === 'Lead MOM Sent').length],
      ['Active leads', leads.filter((lead) => lead.status === 'Active').length],
    ],
    [leads],
  );

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(''), 2600);
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

  function closeLeadForm() {
    setIsFormOpen(false);
    setLeadForm(initialLeadForm);
  }

  function openLeadDrawer(lead) {
    setSelectedLeadId(lead.id);
    setDraftLead({ ...lead });
    setMomDraft(lead.mom || createLeadMomDraft(lead));
    setIsEditingLead(false);
    setIsMomOpen(false);
    setShowMomPreview(false);
  }

  function closeLeadDrawer() {
    setSelectedLeadId(null);
    setDraftLead(null);
    setIsEditingLead(false);
    setIsMomOpen(false);
    setShowMomPreview(false);
  }

  function handleCreateLead(event) {
    event.preventDefault();
    addLead(leadForm);
    showSuccess('Lead created successfully');
    closeLeadForm();
  }

  function saveLeadChanges() {
    updateLead(selectedLeadId, draftLead);
    setIsEditingLead(false);
    showSuccess('Lead updated successfully');
  }

  function openMomEditor() {
    const nextDraft = selectedLead?.mom || createLeadMomDraft(draftLead || selectedLead);
    setMomDraft(nextDraft);
    setIsMomOpen(true);
    setShowMomPreview(false);
  }

  function handleSaveMomDraft() {
    saveLeadMomDraft(selectedLeadId, momDraft);
    showSuccess('Lead MOM draft saved');
  }

  function handleSendMom() {
    sendLeadMom(selectedLeadId, momDraft);
    setIsMomOpen(false);
    setShowMomPreview(false);
    showSuccess('Lead MOM sent successfully');
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Lead Management"
        description="Capture initial business leads, manage client details, and create the Lead MOM."
        actions={
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700"
          >
            New Lead <Plus className="h-4 w-4" />
          </button>
        }
      />

      <Toast message={successMessage} />

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="enterprise-card p-5">
            <p className="text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold leading-none text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </section>

      <DataTable columns={leadColumns} rows={leads} onRowClick={openLeadDrawer} />

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/70 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-semibold leading-tight text-slate-950 dark:text-white">Add New Lead</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Initial lead collection only. Additional workflow details are handled after the Lead MOM is sent.
                </p>
              </div>
              <button
                type="button"
                onClick={closeLeadForm}
                className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
                aria-label="Close add lead form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleCreateLead}>
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
                <button type="button" onClick={closeLeadForm} className="focus-ring rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="focus-ring rounded-xl bg-qpms-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-qpms-600/20 transition hover:bg-qpms-700">
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedLead && draftLead ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm">
          <aside className="h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-qpms-600 dark:text-qpms-300">Lead Detail</p>
                  <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-950 dark:text-white">{selectedLead.company}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Lead collection and Lead MOM workspace.</p>
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
                <button type="button" onClick={() => setIsEditingLead(true)} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white">
                  <Pencil className="h-4 w-4" /> Edit Lead
                </button>
                {isEditingLead ? (
                  <button type="button" onClick={saveLeadChanges} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-qpms-600/20 transition hover:bg-qpms-700">
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                ) : null}
                <button type="button" onClick={openMomEditor} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                  <FileText className="h-4 w-4" /> Create Lead MOM
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <FormSection title="Client Details">
                <TextField label="Client / Company Name" value={draftLead.company} onChange={(value) => updateDraftLead('company', value)} disabled={!isEditingLead} />
                <SelectField label="Industry Type" value={draftLead.industry} onChange={(value) => updateDraftLead('industry', value)} options={industryOptions} disabled={!isEditingLead} />
                <TextField label="Site Location" value={draftLead.location} onChange={(value) => updateDraftLead('location', value)} disabled={!isEditingLead} />
                <SelectField label="State" value={draftLead.state} onChange={(value) => updateDraftLead('state', value)} options={stateOptions} disabled={!isEditingLead} />
                <TextField label="City" value={draftLead.city} onChange={(value) => updateDraftLead('city', value)} disabled={!isEditingLead} />
              </FormSection>

              <FormSection title="Contact Details">
                <TextField label="Contact Person Name" value={draftLead.contact} onChange={(value) => updateDraftLead('contact', value)} disabled={!isEditingLead} />
                <TextField label="Designation" value={draftLead.designation} onChange={(value) => updateDraftLead('designation', value)} disabled={!isEditingLead} />
                <TextField label="Contact Number" value={draftLead.phone} onChange={(value) => updateDraftLead('phone', value)} disabled={!isEditingLead} />
                <TextField label="Email ID" type="email" value={draftLead.email} onChange={(value) => updateDraftLead('email', value)} disabled={!isEditingLead} />
              </FormSection>

              <FormSection title="Lead Information">
                <SelectField label="Lead Source" value={draftLead.source} onChange={(value) => updateDraftLead('source', value)} options={sourceOptions} disabled={!isEditingLead} />
                <SelectField label="Lead Priority" value={draftLead.priority} onChange={(value) => updateDraftLead('priority', value)} options={priorityOptions} disabled={!isEditingLead} />
                <SelectField label="Assigned BD Executive" value={draftLead.executive} onChange={(value) => updateDraftLead('executive', value)} options={executiveOptions} disabled={!isEditingLead} />
                <SelectField label="Status" value={draftLead.status} onChange={(value) => updateDraftLead('status', value)} options={statusOptions} disabled={!isEditingLead} />
                <div className="md:col-span-2">
                  <TextField label="Remarks" value={draftLead.remarks} onChange={(value) => updateDraftLead('remarks', value)} multiline disabled={!isEditingLead} />
                </div>
              </FormSection>

              <section className="enterprise-card p-5">
                <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Activity Timeline</h3>
                <div className="mt-4 space-y-3">
                  {(selectedLead.activity || []).map((item, index) => (
                    <div key={`${item}-${index}`} className="flex gap-3">
                      <div className="mt-2 h-2.5 w-2.5 rounded-full bg-qpms-500" />
                      <p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              {isMomOpen ? (
                <section className="enterprise-card p-5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-qpms-600" />
                    <h3 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Lead MOM Email Editor</h3>
                  </div>
                  <div className="mt-5 grid gap-4">
                    <TextField label="To" value={momDraft.to} onChange={(value) => updateMomDraft('to', value)} />
                    <TextField label="CC" value={momDraft.cc} onChange={(value) => updateMomDraft('cc', value)} />
                    <TextField label="Subject" value={momDraft.subject} onChange={(value) => updateMomDraft('subject', value)} />
                    <TextField label="Discussion Summary" value={momDraft.discussionSummary} onChange={(value) => updateMomDraft('discussionSummary', value)} multiline />
                    <TextField label="Service Scope Discussion" value={momDraft.serviceScopeDiscussion} onChange={(value) => updateMomDraft('serviceScopeDiscussion', value)} multiline />
                    <TextField label="Action Items" value={momDraft.actionItems} onChange={(value) => updateMomDraft('actionItems', value)} multiline />
                    <TextField label="Next Follow-up Date" type="date" value={momDraft.nextFollowUpDate} onChange={(value) => updateMomDraft('nextFollowUpDate', value)} />
                    <TextField label="Remarks" value={momDraft.remarks} onChange={(value) => updateMomDraft('remarks', value)} multiline />
                  </div>

                  {showMomPreview ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950/55 dark:text-slate-300">
                      <p className="font-bold text-slate-950 dark:text-white">{momDraft.subject}</p>
                      <p className="mt-3 whitespace-pre-line">{momDraft.discussionSummary}</p>
                      <p className="mt-3 whitespace-pre-line">{momDraft.serviceScopeDiscussion}</p>
                      <p className="mt-3 whitespace-pre-line">{momDraft.actionItems}</p>
                      <p className="mt-3">Next follow-up: {momDraft.nextFollowUpDate || 'To be confirmed'}</p>
                      <p className="mt-3 whitespace-pre-line">{momDraft.remarks}</p>
                    </div>
                  ) : null}

                  <div className="sticky bottom-0 mt-5 flex flex-wrap gap-3 border-t border-slate-100 bg-white/95 pt-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
                    <button type="button" onClick={handleSaveMomDraft} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white">
                      <Save className="h-4 w-4" /> Save Draft
                    </button>
                    <button type="button" onClick={() => setShowMomPreview((value) => !value)} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white">
                      <FileText className="h-4 w-4" /> Preview Email
                    </button>
                    <button type="button" onClick={handleSendMom} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
                      <Send className="h-4 w-4" /> Send MOM
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
