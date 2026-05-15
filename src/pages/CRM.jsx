import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Plus, X } from 'lucide-react';
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

function TextField({ label, value, onChange, type = 'text', required = false, multiline = false }) {
  const className =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200';

  return (
    <label className="block">
      <span className="text-sm font-semibold leading-5 text-slate-700 dark:text-slate-300">{label}</span>
      {multiline ? (
        <textarea className={`${className} min-h-24 resize-none`} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
      ) : (
        <input className={className} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold leading-5 text-slate-700 dark:text-slate-300">{label}</span>
      <select
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
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

export default function CRM() {
  const [rows, setRows] = useState(leadRows);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [successMessage, setSuccessMessage] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  usePageTitle('Lead Management');

  const stats = useMemo(
    () => [
      ['Business assigned', rows.filter((row) => row.executive && row.executive !== 'Unassigned').length],
      ['New leads', rows.filter((row) => row.stage === 'New Lead').length],
      ['Awaiting commercial', rows.filter((row) => row.stage === 'Commercial Review').length],
      ['Follow-ups due', rows.length + 22],
    ],
    [rows],
  );

  function updateLeadForm(key, value) {
    setLeadForm((current) => ({ ...current, [key]: value }));
  }

  function closeForm() {
    setIsFormOpen(false);
    setLeadForm(initialLeadForm);
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
    };

    setRows((currentRows) => [nextLead, ...currentRows]);
    setActivityLog((currentLog) => ['New lead created from desktop application', ...currentLog].slice(0, 3));
    setSuccessMessage('Lead created successfully');
    closeForm();
    window.setTimeout(() => setSuccessMessage(''), 2600);
  }

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

      <DataTable columns={columns} rows={rows} />

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
    </div>
  );
}
