import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/auth-context.js';
import { useWorkflow } from '../context/workflow-context.js';
import { canViewBdTeam } from '../data/mockUsers.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { sendSiteVisitMomEmail } from '../services/mailService.js';

const siteVisitColumns = [
  { key: 'company', label: 'Client / Company' },
  { key: 'scheduledVisitDate', label: 'Scheduled Visit Date', render: (row) => formatDate(row.scheduledVisitDate) },
  { key: 'scheduledVisitTime', label: 'Scheduled Visit Time', render: (row) => formatTime(row.scheduledVisitTime) },
  { key: 'executive', label: 'Assigned BD Executive' },
  { key: 'momStatus', label: 'Site MOM Status', render: (row) => <StatusBadge status={row.momStatus || 'Pending'} /> },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'location', label: 'Site Location', wrap: true },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const surveySections = [
  'Basic Site Information',
  'Scope of IFM Services',
  'Hard Services',
  'Soft Services',
  'Landscaping & Pest Control',
  'HSE Compliance',
  'Manpower Requirement',
  'Tools / Equipment / Consumables',
  'Client KYC',
  'Risk Assessment',
  'Penalty Clauses',
  'Commercial Statement',
  'Approval Mechanism',
  'Final Remarks & Sign-Off',
];

const photoSlots = [
  'Entrance',
  'Service Area',
  'Equipment Scope',
  'HK Area',
  'Washroom',
  'Electrical Room',
  'Fire Panel',
  'Pump Room',
  'DG Area',
  'Basement / Parking',
  'Waste Disposal Area',
];

const hardServiceGroups = [
  {
    key: 'mechanical',
    title: '3.1 Mechanical Services',
    items: ['HVAC Systems', 'Chillers', 'AHU', 'FCU', 'Ventilation Systems', 'Pumps', 'Fire Fighting System', 'STP / WTP', 'RO Plant', 'Air Compressors', 'Exhaust Systems'],
    fields: ['quantity', 'capacity', 'existingCondition', 'vendorSupportAvailable', 'remarks'],
  },
  {
    key: 'electrical',
    title: '3.2 Electrical Services',
    items: ['Main Panels / MDB', 'SMDB / DB', 'Generators', 'UPS Systems', 'Lighting Systems', 'Transformers', 'LT Panels', 'Solar Systems', 'Battery Banks'],
    fields: ['capacity', 'existingLoad', 'backupAvailability', 'amcExisting', 'remarks'],
  },
  {
    key: 'plumbing',
    title: '3.3 Plumbing Services',
    items: ['Water Supply', 'Drainage', 'Sewage', 'Water Tanks', 'Transfer Pumps', 'Pressure Pumps', 'Borewell Systems'],
    fields: ['quantity', 'existingCondition', 'operationalIssues', 'remarks'],
  },
  {
    key: 'technical',
    title: '3.4 Technical Services',
    items: ['BMS', 'CCTV', 'Access Control', 'Fire Alarm', 'PA Systems', 'Networking', 'Server Rooms', 'Data Center Cooling'],
    fields: ['quantity', 'existingCondition', 'vendorSupportAvailable', 'remarks'],
  },
];

const softServiceGroups = [
  {
    key: 'housekeeping',
    title: 'Housekeeping',
    items: ['Lobby', 'Common Areas', 'Washrooms', 'Cafeteria', 'Parking', 'External Areas', 'Glass Cleaning', 'Facade Cleaning', 'Pantry', 'Waste Collection Points'],
    fields: ['frequency', 'areaSize', 'manpowerRequired', 'shiftRequirement', 'remarks'],
  },
  {
    key: 'security',
    title: 'Security Services',
    items: ['CCTV Monitoring', 'Access Control', 'Visitor Management', 'Emergency Response', 'Parking Security', 'Night Patrol', 'Baggage Screening'],
    fields: ['numberOfGuards', 'shiftPattern', 'criticalAreas', 'risks', 'remarks'],
  },
  {
    key: 'wasteManagement',
    title: 'Waste Management',
    items: ['General Waste', 'Dry Waste', 'Wet Waste', 'Biomedical Waste', 'Hazardous Waste', 'E-Waste'],
    fields: ['disposalFrequency', 'vendorAvailable', 'segregationSystem', 'remarks'],
  },
];

const hseItems = ['Fire Safety', 'Emergency Exit', 'PPE', 'Chemical Storage', 'Safety Signage', 'Electrical Safety', 'Work at Height Safety', 'First Aid', 'Emergency Response Plan'];
const manpowerDepartments = ['Housekeeping', 'Security', 'Technical', 'Waste Management', 'Landscaping', 'Pantry', 'Helpdesk'];
const riskTypes = ['Financial Risk', 'Operational Risk', 'Compliance Risk', 'Workforce Risk', 'Safety Risk', 'Client Reputation Risk'];
const ifmScopeItems = ['Hard Services MEP', 'Soft Services Housekeeping', 'Security Services', 'Waste Management', 'Landscaping Irrigation', 'Pest Control', 'Helpdesk CAFM', 'Energy Management', 'Sustainability ESG', 'Other Services'];
const landscapeItems = ['Gardens', 'Indoor Plants', 'External Green Areas', 'Pest Control', 'Rodent Control', 'Mosquito Control'];

const defaultSurvey = {
  siteAddress: '',
  siteType: '',
  operatingHours: '',
  clientOccupancy: '',
  buildingAge: '',
  siteSurveyDate: '',
  assessedBy: '',
  siteContactPerson: '',
  contactNumber: '',
  contactEmail: '',
  totalSiteArea: '',
  contractPeriod: '',
  marginAgreed: '',
  marginType: 'Percentage',
  paymentTerms: '',
  groupOrSisterConcernBusiness: 'No',
  is247Operation: 'No',
  takeoverComplexity: 'Medium',
  ifmScope: {},
  hardServices: {},
  softServices: {},
  landscaping: {},
  hseCompliance: hseItems.map((item) => ({ item, status: 'Partial', severity: 'Medium', remarks: '' })),
  manpowerPlan: manpowerDepartments.map((department) => ({
    id: `${department}-1`,
    department,
    designation: department === 'Security' ? 'Security Guard' : department === 'Technical' ? 'Technician' : 'Associate',
    shiftType: 'General',
    count: 0,
    relieverRequired: 'No',
    otRequired: 'No',
    accommodationRequired: 'No',
    transportationRequired: 'No',
    wageCategory: 'Skilled',
    remarks: '',
  })),
  equipment: [{ id: 'equipment-1', name: 'Ride-on Scrubber', brand: '', capacity: '', quantity: 1, purchaseType: 'Rental', vendor: '', monthlyCost: 0, remarks: '' }],
  chemicals: [{ id: 'chemical-1', name: 'Floor Cleaner', brand: '', usageArea: 'Common Areas', quantity: 1, monthlyConsumption: '' }],
  tools: [{ id: 'tool-1', name: 'Mop Set', quantity: 1, department: 'Housekeeping', remarks: '' }],
  clientKyc: { gstRegistration: '', pan: '', aadhaar: '', tan: '', kycRemarks: '', documentUploadPlaceholders: '', billingAddress: '', complianceDocs: '' },
  penaltyClauses: { penaltyClauseAvailable: 'No', penaltyDetails: '', riskImpact: 'Medium', remarks: '' },
  risks: riskTypes.map((name) => ({ name, level: 'Medium', notes: '', mitigation: '' })),
  commercial: {
    billingComponents: [
      { id: 'bill-1', name: 'Manpower Billing', amount: 0 },
      { id: 'bill-2', name: 'Equipment Billing', amount: 0 },
    ],
    expenseComponents: [
      { id: 'expense-1', name: 'Wages', amount: 0 },
      { id: 'expense-2', name: 'Consumables', amount: 0 },
    ],
    nonBillableCost: 0,
  },
  approvalWorkflow: '',
  operationsTeamApproval: 'Pending',
  hrWageVetting: 'Pending',
  procurementEquipmentTccCosting: 'Pending',
  commercialVetting: 'Pending',
  financeViabilityReview: 'Pending',
  commercialGreenSignal: 'Pending',
  finalRemarks: '',
  signOffName: '',
};

function mergeSurvey(survey = {}) {
  return {
    ...defaultSurvey,
    ...survey,
    ifmScope: { ...defaultSurvey.ifmScope, ...(survey.ifmScope || {}) },
    hardServices: { ...defaultSurvey.hardServices, ...(survey.hardServices || {}) },
    softServices: { ...defaultSurvey.softServices, ...(survey.softServices || {}) },
    landscaping: { ...defaultSurvey.landscaping, ...(survey.landscaping || {}) },
    clientKyc: { ...defaultSurvey.clientKyc, ...(survey.clientKyc || {}) },
    commercial: {
      ...defaultSurvey.commercial,
      ...(survey.commercial || {}),
      billingComponents: survey.commercial?.billingComponents || defaultSurvey.commercial.billingComponents,
      expenseComponents: survey.commercial?.expenseComponents || defaultSurvey.commercial.expenseComponents,
    },
    hseCompliance: survey.hseCompliance || defaultSurvey.hseCompliance,
    manpowerPlan: survey.manpowerPlan || defaultSurvey.manpowerPlan,
    equipment: survey.equipment || defaultSurvey.equipment,
    chemicals: survey.chemicals || defaultSurvey.chemicals,
    tools: survey.tools || defaultSurvey.tools,
    risks: survey.risks || defaultSurvey.risks,
  };
}

function TextField({ label, value, onChange, multiline = false, type = 'text' }) {
  const fieldClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium leading-5 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200';

  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</span>
      {multiline ? (
        <textarea className={`${fieldClass} min-h-24 resize-none leading-6`} value={value || ''} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={fieldClass} type={type} value={value ?? ''} onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)} />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <select
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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

function currency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function fieldLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (text) => text.toUpperCase());
}

function buildSiteVisitMom(visit, survey) {
  const selectedHard = hardServiceGroups.flatMap((group) => Object.keys(survey.hardServices?.[group.key] || {}));
  const selectedSoft = softServiceGroups.flatMap((group) => Object.keys(survey.softServices?.[group.key] || {}));
  return {
    to: visit.email || '',
    cc: 'bdhead@qpms.in, commercial@qpms.in, operations@qpms.in',
    subject: `Site Visit MOM - ${visit.company} - QPMS`,
    summary: `Pre-operational facility assessment completed for ${visit.company} at ${visit.location || visit.city}.`,
    scope: [...Object.keys(survey.ifmScope || {}).filter((key) => survey.ifmScope[key]?.selected), ...selectedHard, ...selectedSoft].join(', ') || 'IFM service scope to be finalized from survey inputs.',
    requirements: `Manpower rows: ${survey.manpowerPlan.length}. Equipment items: ${survey.equipment.length}. Tools: ${survey.tools.length}. Chemicals: ${survey.chemicals.length}.`,
    commercialNotes: `Estimated revenue ${currency(getCommercialTotals(survey).revenue)} with expected margin ${getCommercialTotals(survey).marginPercent.toFixed(1)}%.`,
    nextAction: 'Submit for Commercial Review',
    sent: false,
  };
}

function getCommercialTotals(survey) {
  const revenue = (survey.commercial.billingComponents || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expenses = (survey.commercial.expenseComponents || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const nonBillable = Number(survey.commercial.nonBillableCost || 0);
  const monthlyCost = expenses + nonBillable;
  const margin = revenue - monthlyCost;
  const marginPercent = revenue ? (margin / revenue) * 100 : 0;
  return { revenue, expenses, nonBillable, monthlyCost, margin, marginPercent };
}

function normalizeStage(stage) {
  return stage === 'Site Survey / Assessment' ? 'Pre-Operational Assessment' : stage;
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
      <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function CompactStatusBadge({ label, value, tone = 'slate' }) {
  const toneClass = {
    slate: 'border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200',
    blue: 'border-qpms-200 bg-qpms-50 text-qpms-700 dark:border-qpms-500/30 dark:bg-qpms-500/10 dark:text-qpms-200',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${toneClass}`}>
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="text-current">{value}</span>
    </span>
  );
}

function ServiceScopeGrid({ items, values, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const selected = Boolean(values[item]?.selected);
        return (
          <button
            type="button"
            key={item}
            onClick={() => onChange(item, { ...values[item], selected: !selected })}
            className={[
              'rounded-2xl border p-4 text-left transition hover:-translate-y-0.5',
              selected
                ? 'border-qpms-300 bg-qpms-50 shadow-[0_16px_40px_rgba(36,68,164,0.12)] dark:border-qpms-500/40 dark:bg-qpms-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/55',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{item}</span>
              <span className={`h-3 w-3 rounded-full ${selected ? 'bg-qpms-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ExpandableServiceGroup({ group, values, onChange }) {
  const groupValues = values[group.key] || {};

  function updateItem(item, patch) {
    onChange(group.key, {
      ...groupValues,
      [item]: {
        ...(groupValues[item] || {}),
        ...patch,
      },
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
      <h4 className="text-[15px] font-bold text-slate-950 dark:text-white">{group.title}</h4>
      <div className="mt-4 grid gap-3">
        {group.items.map((item) => {
          const selected = Boolean(groupValues[item]?.selected);
          return (
            <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <button type="button" onClick={() => updateItem(item, { selected: !selected })} className="flex w-full items-center justify-between gap-3 text-left">
                <span className="font-semibold text-slate-900 dark:text-white">{item}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${selected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {selected ? 'Selected' : 'Select'}
                </span>
              </button>
              {selected ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {group.fields.map((field) =>
                    field.includes('Available') || field.includes('Existing') || field === 'backupAvailability' || field === 'amcExisting' ? (
                      <SelectField key={field} label={fieldLabel(field)} value={groupValues[item]?.[field] || 'No'} onChange={(value) => updateItem(item, { [field]: value })} options={['Yes', 'No', 'Partial', 'NA']} />
                    ) : (
                      <TextField key={field} label={fieldLabel(field)} value={groupValues[item]?.[field] || ''} onChange={(value) => updateItem(item, { [field]: value })} multiline={field === 'remarks' || field === 'risks' || field === 'operationalIssues'} />
                    ),
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PhotoEvidenceSection({ photos, onAdd, onRemove, onPreview }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-[17px] font-bold text-slate-950 dark:text-white">Site Photos & Evidence</h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload evidence only from Basic Site Information. Other sections stay structured and audit-focused.</p>
        </div>
        <span className="rounded-full bg-qpms-50 px-3 py-1 text-xs font-bold text-qpms-700 dark:bg-qpms-500/15 dark:text-qpms-200">
          {Object.values(photos).reduce((sum, items) => sum + items.length, 0)} images
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {photoSlots.map((slot) => {
          const slotPhotos = photos[slot] || [];
          return (
            <div key={slot} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{slot}</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-950">{slotPhotos.length}</span>
              </div>
              <label className="mt-3 flex h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-center text-slate-400 transition hover:border-qpms-300 hover:text-qpms-600 dark:border-slate-800 dark:bg-slate-950">
                <UploadCloud className="h-6 w-6" />
                <span className="mt-2 text-xs font-bold">Drop or browse image</span>
                <input className="hidden" type="file" accept="image/*" multiple onChange={(event) => onAdd(slot, Array.from(event.target.files || []))} />
              </label>
              {slotPhotos.length ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {slotPhotos.map((photo) => (
                    <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800">
                      <img src={photo.url} alt={photo.name} className="h-20 w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-slate-950/0 opacity-0 transition group-hover:bg-slate-950/45 group-hover:opacity-100">
                        <button type="button" onClick={() => onPreview(photo)} className="rounded-lg bg-white p-1.5 text-slate-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => onRemove(slot, photo.id)} className="rounded-lg bg-white p-1.5 text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AuditTable({ rows, onChange }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950">
            <tr>
              {['Compliance Item', 'Status', 'Risk Severity', 'Remarks'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {rows.map((row, index) => (
              <tr key={row.item}>
                <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">{row.item}</td>
                <td className="px-4 py-3"><SelectField label="" value={row.status} onChange={(value) => onChange(index, { status: value })} options={['Compliant', 'Partial', 'Non-Compliant']} /></td>
                <td className="px-4 py-3"><SelectField label="" value={row.severity} onChange={(value) => onChange(index, { severity: value })} options={['Low', 'Medium', 'High', 'Critical']} /></td>
                <td className="px-4 py-3 min-w-64"><TextField label="" value={row.remarks} onChange={(value) => onChange(index, { remarks: value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditableTable({ columns, rows, onChange, onAdd, onRemove, addLabel }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{column.label}</th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key} className="min-w-36 px-3 py-3">
                    {column.type === 'select' ? (
                      <SelectField label="" value={row[column.key]} onChange={(value) => onChange(rowIndex, { [column.key]: value })} options={column.options} />
                    ) : (
                      <TextField label="" type={column.type || 'text'} value={row[column.key]} onChange={(value) => onChange(rowIndex, { [column.key]: value })} />
                    )}
                  </td>
                ))}
                <td className="px-3 py-3">
                  <button type="button" onClick={() => onRemove(rowIndex)} className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={onAdd} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </section>
  );
}

function RiskCards({ risks, onChange }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {risks.map((risk, index) => (
        <section key={risk.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-950 dark:text-white">{risk.name}</h4>
          </div>
          <div className="mt-4 grid gap-4">
            <SelectField label="Risk Level" value={risk.level} onChange={(value) => onChange(index, { level: value })} options={['Low', 'Medium', 'High', 'Critical']} />
            <TextField label="Notes" value={risk.notes} onChange={(value) => onChange(index, { notes: value })} multiline />
            <TextField label="Mitigation Plan" value={risk.mitigation} onChange={(value) => onChange(index, { mitigation: value })} multiline />
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Sites() {
  const { user } = useAuth();
  const {
    siteVisits,
    saveSiteSurvey,
    saveSiteVisitMom,
    sendSiteVisitMom,
    submitCommercialReview,
    uploadSiteImage,
  } = useWorkflow();
  const [query, setQuery] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [surveyDraft, setSurveyDraft] = useState(null);
  const [photoEvidence, setPhotoEvidence] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [siteMomDraft, setSiteMomDraft] = useState(null);
  const [showMomPreview, setShowMomPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [autoSaveLabel, setAutoSaveLabel] = useState('Saved locally');
  usePageTitle('Site Visit & Estimation');

  const visibleSiteVisits = useMemo(() => {
    if (canViewBdTeam(user)) return siteVisits;
    return siteVisits.filter((visit) => visit.assigned_bd_email === user?.email || visit.created_by_user_id === user?.id);
  }, [siteVisits, user]);

  const selectedVisit = visibleSiteVisits.find((visit) => visit.id === selectedVisitId);
  const selectedStage = normalizeStage(selectedVisit?.currentStage || 'Pre-Operational Assessment');
  const activeSection = surveySections[activeSectionIndex];

  const filteredVisits = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return visibleSiteVisits;
    return visibleSiteVisits.filter((visit) =>
      [visit.company, visit.contact, visit.state, visit.city, visit.location, visit.status].some((item) =>
        String(item || '').toLowerCase().includes(value),
      ),
    );
  }, [query, visibleSiteVisits]);

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(''), 2600);
  }

  function markChanged() {
    setAutoSaveLabel('Unsaved changes');
  }

  function openVisitDrawer(visit) {
    setSelectedVisitId(visit.id);
    setSurveyDraft(mergeSurvey(visit.survey));
    setPhotoEvidence({});
    setSiteMomDraft(visit.siteMom || null);
    setActiveSectionIndex(0);
    setShowMomPreview(false);
    setAutoSaveLabel('Saved locally');
  }

  function closeVisitDrawer() {
    setSelectedVisitId(null);
    setSurveyDraft(null);
    setPhotoEvidence({});
    setPreviewPhoto(null);
    setSiteMomDraft(null);
    setShowMomPreview(false);
  }

  function updateSurveyDraft(key, value) {
    markChanged();
    setSurveyDraft((current) => ({ ...current, [key]: value }));
  }

  function updateNested(section, value) {
    markChanged();
    setSurveyDraft((current) => ({ ...current, [section]: value }));
  }

  function updateArray(section, index, patch) {
    markChanged();
    setSurveyDraft((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function addRow(section, row) {
    markChanged();
    setSurveyDraft((current) => ({ ...current, [section]: [...current[section], { ...row, id: `${section}-${Date.now()}` }] }));
  }

  function removeRow(section, index) {
    markChanged();
    setSurveyDraft((current) => ({ ...current, [section]: current[section].filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function addPhotos(slot, files) {
    const nextPhotos = files.map((file) => ({ id: `${slot}-${file.name}-${Date.now()}-${Math.random()}`, name: file.name, url: URL.createObjectURL(file) }));
    setPhotoEvidence((current) => ({ ...current, [slot]: [...(current[slot] || []), ...nextPhotos] }));
    if (selectedVisit) {
      const uploaded = await Promise.all(
        files.map((file) =>
          uploadSiteImage({
            visit: selectedVisit,
            assessmentId: selectedVisit.assessmentId,
            category: slot,
            file,
            uploadedBy: user?.email,
          }),
        ),
      );
      const uploadedPhotos = uploaded.filter(Boolean);
      if (uploadedPhotos.length) {
        setPhotoEvidence((current) => ({ ...current, [slot]: [...(current[slot] || []), ...uploadedPhotos] }));
        showSuccess('Site images uploaded to Supabase');
      }
    }
  }

  function removePhoto(slot, id) {
    setPhotoEvidence((current) => ({ ...current, [slot]: (current[slot] || []).filter((photo) => photo.id !== id) }));
  }

  function updateMomDraft(key, value) {
    setSiteMomDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSaveDraft() {
    saveSiteSurvey(selectedVisitId, surveyDraft, 'Draft', user);
    setAutoSaveLabel('Saved locally');
    showSuccess('Pre-operational assessment draft saved');
  }

  function handleGenerateMom() {
    saveSiteSurvey(selectedVisitId, surveyDraft, 'Draft', user);
    const nextMom = buildSiteVisitMom(selectedVisit, surveyDraft);
    setSiteMomDraft(nextMom);
    saveSiteVisitMom(selectedVisitId, nextMom);
    setShowMomPreview(true);
    setAutoSaveLabel('Saved locally');
    showSuccess('Site Visit MOM generated');
  }

  async function handleSendMom() {
    const nextMom = siteMomDraft || buildSiteVisitMom(selectedVisit, surveyDraft);
    try {
      await sendSiteVisitMomEmail(nextMom, selectedVisit);
      sendSiteVisitMom(selectedVisitId, nextMom);
      setSiteMomDraft({ ...nextMom, sent: true });
      showSuccess('Site Visit MOM sent successfully');
    } catch (error) {
      showSuccess(`Email failed: ${error.response?.data?.message || error.message}`);
    }
  }

  function handleSubmitCommercialReview() {
    saveSiteSurvey(selectedVisitId, surveyDraft, 'Submitted', user);
    submitCommercialReview(selectedVisitId);
    setAutoSaveLabel('Submitted');
    showSuccess('Submitted for Commercial Review');
  }

  function renderActiveSection() {
    if (!surveyDraft) return null;

    switch (activeSection) {
      case 'Basic Site Information':
        return (
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <TextField label="Site Address" value={surveyDraft.siteAddress} onChange={(value) => updateSurveyDraft('siteAddress', value)} />
                <TextField label="Site Type" value={surveyDraft.siteType} onChange={(value) => updateSurveyDraft('siteType', value)} />
                <TextField label="Operating Hours" value={surveyDraft.operatingHours} onChange={(value) => updateSurveyDraft('operatingHours', value)} />
                <TextField label="Client Occupancy" value={surveyDraft.clientOccupancy} onChange={(value) => updateSurveyDraft('clientOccupancy', value)} />
                <TextField label="Building Age" value={surveyDraft.buildingAge} onChange={(value) => updateSurveyDraft('buildingAge', value)} />
                <SelectField label="Takeover Complexity" value={surveyDraft.takeoverComplexity} onChange={(value) => updateSurveyDraft('takeoverComplexity', value)} options={['Low', 'Medium', 'High', 'Critical']} />
                <TextField label="Site Survey Date" type="date" value={surveyDraft.siteSurveyDate} onChange={(value) => updateSurveyDraft('siteSurveyDate', value)} />
                <TextField label="Assessed By" value={surveyDraft.assessedBy} onChange={(value) => updateSurveyDraft('assessedBy', value)} />
                <TextField label="Site Contact Person" value={surveyDraft.siteContactPerson} onChange={(value) => updateSurveyDraft('siteContactPerson', value)} />
                <TextField label="Contact Number" value={surveyDraft.contactNumber} onChange={(value) => updateSurveyDraft('contactNumber', value)} />
                <TextField label="Contact Email" type="email" value={surveyDraft.contactEmail} onChange={(value) => updateSurveyDraft('contactEmail', value)} />
                <TextField label="Total Site Area" value={surveyDraft.totalSiteArea} onChange={(value) => updateSurveyDraft('totalSiteArea', value)} />
                <TextField label="Contract Period" value={surveyDraft.contractPeriod} onChange={(value) => updateSurveyDraft('contractPeriod', value)} />
                <TextField label="Margin Agreed" value={surveyDraft.marginAgreed} onChange={(value) => updateSurveyDraft('marginAgreed', value)} />
                <SelectField label="Margin Type" value={surveyDraft.marginType} onChange={(value) => updateSurveyDraft('marginType', value)} options={['Percentage', 'Fixed Value', 'Not Finalized']} />
                <TextField label="Payment Terms" value={surveyDraft.paymentTerms} onChange={(value) => updateSurveyDraft('paymentTerms', value)} />
                <SelectField label="Group / Sister Concern Business" value={surveyDraft.groupOrSisterConcernBusiness} onChange={(value) => updateSurveyDraft('groupOrSisterConcernBusiness', value)} options={['Yes', 'No']} />
                <SelectField label="24 / 7 Operation" value={surveyDraft.is247Operation} onChange={(value) => updateSurveyDraft('is247Operation', value)} options={['Yes', 'No']} />
              </div>
            </section>
            <PhotoEvidenceSection photos={photoEvidence} onAdd={addPhotos} onRemove={removePhoto} onPreview={setPreviewPhoto} />
          </div>
        );
      case 'Scope of IFM Services':
        return (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
            <ServiceScopeGrid
              items={ifmScopeItems}
              values={surveyDraft.ifmScope}
              onChange={(item, value) => updateNested('ifmScope', { ...surveyDraft.ifmScope, [item]: value })}
            />
          </section>
        );
      case 'Hard Services':
        return (
          <div className="space-y-5">
            {hardServiceGroups.map((group) => (
              <ExpandableServiceGroup key={group.key} group={group} values={surveyDraft.hardServices} onChange={(groupKey, value) => updateNested('hardServices', { ...surveyDraft.hardServices, [groupKey]: value })} />
            ))}
          </div>
        );
      case 'Soft Services':
        return (
          <div className="space-y-5">
            {softServiceGroups.map((group) => (
              <ExpandableServiceGroup key={group.key} group={group} values={surveyDraft.softServices} onChange={(groupKey, value) => updateNested('softServices', { ...surveyDraft.softServices, [groupKey]: value })} />
            ))}
          </div>
        );
      case 'Landscaping & Pest Control':
        return (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
            <ServiceScopeGrid
              items={landscapeItems}
              values={surveyDraft.landscaping}
              onChange={(item, value) => updateNested('landscaping', { ...surveyDraft.landscaping, [item]: value })}
            />
          </section>
        );
      case 'HSE Compliance':
        return <AuditTable rows={surveyDraft.hseCompliance} onChange={(index, patch) => updateArray('hseCompliance', index, patch)} />;
      case 'Manpower Requirement':
        return (
          <div className="space-y-5">
            <EditableTable
              columns={[
                { key: 'department', label: 'Department', type: 'select', options: manpowerDepartments },
                { key: 'designation', label: 'Designation' },
                { key: 'shiftType', label: 'Shift Type', type: 'select', options: ['General', 'Day', 'Night', 'Rotational'] },
                { key: 'count', label: 'Count', type: 'number' },
                { key: 'relieverRequired', label: 'Reliever?', type: 'select', options: ['Yes', 'No'] },
                { key: 'otRequired', label: 'OT?', type: 'select', options: ['Yes', 'No'] },
                { key: 'accommodationRequired', label: 'Accommodation?', type: 'select', options: ['Yes', 'No'] },
                { key: 'transportationRequired', label: 'Transportation?', type: 'select', options: ['Yes', 'No'] },
                { key: 'wageCategory', label: 'Wage Category', type: 'select', options: ['Unskilled', 'Semi-skilled', 'Skilled', 'Highly Skilled'] },
                { key: 'remarks', label: 'Remarks' },
              ]}
              rows={surveyDraft.manpowerPlan}
              onChange={(index, patch) => updateArray('manpowerPlan', index, patch)}
              onAdd={() => addRow('manpowerPlan', defaultSurvey.manpowerPlan[0])}
              onRemove={(index) => removeRow('manpowerPlan', index)}
              addLabel="Add manpower row"
            />
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {['minimumWagesType', 'applicableZone', 'wageComputationNotes', 'relieverCostRequired', 'budgetedTakeHomeFeasibility', 'localWorkforceAvailability', 'transportationImpact', 'bonusPaymentType', 'leaveWithWagesDays', 'nfhApplicable', 'travelAccommodationProvided'].map((key) => (
                  <TextField key={key} label={fieldLabel(key)} value={surveyDraft[key]} onChange={(value) => updateSurveyDraft(key, value)} multiline={key.includes('Notes')} />
                ))}
              </div>
            </section>
          </div>
        );
      case 'Tools / Equipment / Consumables':
        return (
          <div className="space-y-5">
            <EditableTable
              columns={[
                { key: 'name', label: 'Equipment Name' },
                { key: 'brand', label: 'Brand' },
                { key: 'capacity', label: 'Capacity' },
                { key: 'quantity', label: 'Quantity', type: 'number' },
                { key: 'purchaseType', label: 'Purchase / Rental', type: 'select', options: ['Purchase', 'Rental'] },
                { key: 'vendor', label: 'Vendor' },
                { key: 'monthlyCost', label: 'Monthly Cost', type: 'number' },
                { key: 'remarks', label: 'Remarks' },
              ]}
              rows={surveyDraft.equipment}
              onChange={(index, patch) => updateArray('equipment', index, patch)}
              onAdd={() => addRow('equipment', defaultSurvey.equipment[0])}
              onRemove={(index) => removeRow('equipment', index)}
              addLabel="Add equipment"
            />
            <EditableTable
              columns={[
                { key: 'name', label: 'Chemical Name' },
                { key: 'brand', label: 'Brand' },
                { key: 'usageArea', label: 'Usage Area' },
                { key: 'quantity', label: 'Quantity', type: 'number' },
                { key: 'monthlyConsumption', label: 'Monthly Consumption' },
              ]}
              rows={surveyDraft.chemicals}
              onChange={(index, patch) => updateArray('chemicals', index, patch)}
              onAdd={() => addRow('chemicals', defaultSurvey.chemicals[0])}
              onRemove={(index) => removeRow('chemicals', index)}
              addLabel="Add chemical"
            />
            <EditableTable
              columns={[
                { key: 'name', label: 'Tool Name' },
                { key: 'quantity', label: 'Quantity', type: 'number' },
                { key: 'department', label: 'Department', type: 'select', options: manpowerDepartments },
                { key: 'remarks', label: 'Remarks' },
              ]}
              rows={surveyDraft.tools}
              onChange={(index, patch) => updateArray('tools', index, patch)}
              onAdd={() => addRow('tools', defaultSurvey.tools[0])}
              onRemove={(index) => removeRow('tools', index)}
              addLabel="Add tool"
            />
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              <div className="grid gap-4 md:grid-cols-2">
                {['consumables', 'rentalMachinery', 'nonBillableExpenses', 'uniformsShoesAccessories'].map((key) => (
                  <TextField key={key} label={fieldLabel(key)} value={surveyDraft[key]} onChange={(value) => updateSurveyDraft(key, value)} multiline />
                ))}
              </div>
            </section>
          </div>
        );
      case 'Client KYC':
        return (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(surveyDraft.clientKyc).map(([key, value]) => (
                <TextField key={key} label={fieldLabel(key)} value={value} onChange={(nextValue) => updateNested('clientKyc', { ...surveyDraft.clientKyc, [key]: nextValue })} multiline={key === 'billingAddress' || key === 'complianceDocs'} />
              ))}
            </div>
          </section>
        );
      case 'Risk Assessment':
        return (
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {['clientCreditRating', 'marketAssessment', 'goodPaymaster', 'existingVendorChangeReason', 'mitigationPlan', 'riskRemarks'].map((key) => (
                  <TextField key={key} label={fieldLabel(key)} value={surveyDraft[key]} onChange={(value) => updateSurveyDraft(key, value)} multiline={key.includes('Reason') || key.includes('Plan') || key.includes('Remarks')} />
                ))}
              </div>
            </section>
            <RiskCards risks={surveyDraft.risks} onChange={(index, patch) => updateArray('risks', index, patch)} />
          </div>
        );
      case 'Penalty Clauses':
        return (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Penalty Clause Available" value={surveyDraft.penaltyClauses.penaltyClauseAvailable} onChange={(value) => updateNested('penaltyClauses', { ...surveyDraft.penaltyClauses, penaltyClauseAvailable: value })} options={['Yes', 'No']} />
              <SelectField label="Risk Impact" value={surveyDraft.penaltyClauses.riskImpact} onChange={(value) => updateNested('penaltyClauses', { ...surveyDraft.penaltyClauses, riskImpact: value })} options={['Low', 'Medium', 'High', 'Critical']} />
              <TextField label="Penalty Details" value={surveyDraft.penaltyClauses.penaltyDetails} onChange={(value) => updateNested('penaltyClauses', { ...surveyDraft.penaltyClauses, penaltyDetails: value })} multiline />
              <TextField label="Remarks" value={surveyDraft.penaltyClauses.remarks} onChange={(value) => updateNested('penaltyClauses', { ...surveyDraft.penaltyClauses, remarks: value })} multiline />
            </div>
          </section>
        );
      case 'Commercial Statement': {
        const totals = getCommercialTotals(surveyDraft);
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryPill label="Estimated Revenue" value={currency(totals.revenue)} />
              <SummaryPill label="Monthly Operational Cost" value={currency(totals.monthlyCost)} />
              <SummaryPill label="Expected Margin %" value={`${totals.marginPercent.toFixed(1)}%`} />
            </div>
            <EditableTable
              columns={[
                { key: 'name', label: 'Billing Component' },
                { key: 'amount', label: 'Amount', type: 'number' },
              ]}
              rows={surveyDraft.commercial.billingComponents}
              onChange={(index, patch) => updateNested('commercial', { ...surveyDraft.commercial, billingComponents: surveyDraft.commercial.billingComponents.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) })}
              onAdd={() => updateNested('commercial', { ...surveyDraft.commercial, billingComponents: [...surveyDraft.commercial.billingComponents, { id: `bill-${Date.now()}`, name: '', amount: 0 }] })}
              onRemove={(index) => updateNested('commercial', { ...surveyDraft.commercial, billingComponents: surveyDraft.commercial.billingComponents.filter((_, itemIndex) => itemIndex !== index) })}
              addLabel="Add billing component"
            />
            <EditableTable
              columns={[
                { key: 'name', label: 'Expense Component' },
                { key: 'amount', label: 'Amount', type: 'number' },
              ]}
              rows={surveyDraft.commercial.expenseComponents}
              onChange={(index, patch) => updateNested('commercial', { ...surveyDraft.commercial, expenseComponents: surveyDraft.commercial.expenseComponents.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) })}
              onAdd={() => updateNested('commercial', { ...surveyDraft.commercial, expenseComponents: [...surveyDraft.commercial.expenseComponents, { id: `expense-${Date.now()}`, name: '', amount: 0 }] })}
              onRemove={(index) => updateNested('commercial', { ...surveyDraft.commercial, expenseComponents: surveyDraft.commercial.expenseComponents.filter((_, itemIndex) => itemIndex !== index) })}
              addLabel="Add expense component"
            />
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              <TextField label="Non-Billable Cost" type="number" value={surveyDraft.commercial.nonBillableCost} onChange={(value) => updateNested('commercial', { ...surveyDraft.commercial, nonBillableCost: value })} />
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <SummaryPill label="Expense Components" value={currency(totals.expenses)} />
                <SummaryPill label="Non-Billable Cost" value={currency(totals.nonBillable)} />
                <SummaryPill label="Margin Summary" value={currency(totals.margin)} />
              </div>
            </section>
          </div>
        );
      }
      case 'Approval Mechanism':
        return (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {['operationsTeamApproval', 'hrWageVetting', 'procurementEquipmentTccCosting', 'commercialVetting', 'financeViabilityReview', 'commercialGreenSignal'].map((key) => (
                <SelectField key={key} label={fieldLabel(key)} value={surveyDraft[key]} onChange={(value) => updateSurveyDraft(key, value)} options={['Pending', 'Approved', 'Rejected', 'Not Required']} />
              ))}
              <TextField label="Approval Workflow Notes" value={surveyDraft.approvalWorkflow} onChange={(value) => updateSurveyDraft('approvalWorkflow', value)} multiline />
            </div>
          </section>
        );
      case 'Final Remarks & Sign-Off':
        return (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Final Remarks" value={surveyDraft.finalRemarks} onChange={(value) => updateSurveyDraft('finalRemarks', value)} multiline />
              <TextField label="Assessor / Sign-Off Name" value={surveyDraft.signOffName} onChange={(value) => updateSurveyDraft('signOffName', value)} />
            </div>
          </section>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Site Visit & Estimation"
        description="Pre-operational facility assessment for feasibility, IFM scope, manpower, equipment, risk, and commercial viability."
      />

      <Toast message={successMessage} />

      <section className="enterprise-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Assessment Queue</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Leads appear here after the Lead MOM is sent and the client has scheduled a site visit.
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assessments..."
              className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="mt-5">
          {filteredVisits.length ? (
            <DataTable columns={siteVisitColumns} rows={filteredVisits} embedded onRowClick={openVisitDrawer} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-950/55">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No assessments ready yet</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Send a Lead MOM with scheduled visit details to move the lead into this assessment workflow.
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedVisit && surveyDraft ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm">
          <aside className="h-full w-full max-w-[92rem] overflow-y-auto border-l border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 p-5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-qpms-600 dark:text-qpms-300">Pre-Operational Facility Assessment</p>
                  <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-950 dark:text-white">{selectedVisit.company}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Determine operational feasibility, technical complexity, manpower, risk, and commercial viability before takeover.
                  </p>
                </div>
                <button type="button" onClick={closeVisitDrawer} className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white" aria-label="Close site visit drawer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <CompactStatusBadge label="Client" value={selectedVisit.company} />
                <CompactStatusBadge label="Stage" value={selectedStage} tone="blue" />
                <CompactStatusBadge label="Status" value={selectedVisit.status || 'Draft'} />
                <CompactStatusBadge label="MOM" value={selectedVisit.momStatus || 'Pending'} tone="amber" />
                <CompactStatusBadge label="Visit Date" value={formatDate(selectedVisit.scheduledVisitDate)} />
              </div>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.28fr_0.72fr]">
              <section className="enterprise-card sticky top-44 h-fit p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Assessment Sections</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800">{activeSectionIndex + 1}/{surveySections.length}</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-qpms-600 transition-all" style={{ width: `${((activeSectionIndex + 1) / surveySections.length) * 100}%` }} />
                </div>
                <div className="mt-4 space-y-2">
                  {surveySections.map((section, index) => (
                    <button
                      type="button"
                      key={section}
                      onClick={() => setActiveSectionIndex(index)}
                      className={[
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition',
                        activeSectionIndex === index
                          ? 'bg-qpms-600 text-white shadow-lg shadow-qpms-600/20'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                      ].join(' ')}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">{index + 1}</span>
                      {section}
                    </button>
                  ))}
                </div>
              </section>

              <div className="space-y-6">
                <section className="enterprise-card p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-qpms-600" />
                      <div>
                        <h3 className="text-xl font-semibold leading-6 text-slate-950 dark:text-white">{activeSection}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Structured enterprise assessment controls for IFM takeover decisions.</p>
                      </div>
                    </div>
                    <StatusBadge status={autoSaveLabel === 'Unsaved changes' ? 'Pending' : 'Active'} />
                  </div>
                </section>

                {renderActiveSection()}

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
              </div>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{autoSaveLabel}</div>
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
            </div>
          </aside>
        </div>
      ) : null}

      {previewPhoto ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/75 p-5" onClick={() => setPreviewPhoto(null)}>
          <div className="max-h-[88vh] max-w-5xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-4 px-2">
              <p className="text-sm font-bold text-slate-900">{previewPhoto.name}</p>
              <button type="button" onClick={() => setPreviewPhoto(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <img src={previewPhoto.url} alt={previewPhoto.name} className="max-h-[78vh] w-full rounded-2xl object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
