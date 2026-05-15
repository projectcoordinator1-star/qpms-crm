import { useMemo, useState } from 'react';
import { Camera, ClipboardCheck, MapPin, Save, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StageTracker from '../components/StageTracker.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const siteVisitStages = [
  'Lead',
  'Lead MOM',
  'Lead Confirmed',
  'Site Survey / Assessment',
  'Commercial Review',
  'Finance Validation',
  'Approval Workflow',
  'Proposal / Conversion',
];

const plannedSiteVisits = [
  {
    id: 1,
    company: 'TechPark Facility Hub',
    contact: 'Ramesh Kumar',
    phone: '+91 98765 21001',
    email: 'ramesh@techpark.example',
    state: 'Tamil Nadu',
    city: 'Chennai',
    location: 'OMR IT Corridor, Block C',
    source: 'Converted Lead',
    officer: 'Arun Prakash',
    scheduledDate: '16 May 2026',
    status: 'Active',
    estimate: {
      floors: '9',
      area: '1,85,000 sqft',
      housekeeping: '64 staff across three shifts',
      security: '28 guards with visitor and access control',
      equipment: 'Ride-on scrubber, single-disc machines, wet/dry vacuums',
      consumables: 'Monthly hygiene consumables with pantry and restroom coverage',
      notes: 'Survey to validate tenant movement, basement coverage, and night shift manpower.',
    },
  },
  {
    id: 2,
    company: 'Coastal Care Hospital',
    contact: 'Dr. Priya Menon',
    phone: '+91 98765 21002',
    email: 'priya@coastalcare.example',
    state: 'Kerala',
    city: 'Kochi',
    location: 'Marine Drive Health Campus',
    source: 'Lead MOM Created',
    officer: 'Meera Thomas',
    scheduledDate: '17 May 2026',
    status: 'Pending',
    estimate: {
      floors: '11',
      area: '2,20,000 sqft',
      housekeeping: '92 staff with infection-control coverage',
      security: '36 guards with emergency access support',
      equipment: 'Scrubbers, bio-waste movement trolleys, vacuum units',
      consumables: 'Hospital-grade cleaning chemicals and PPE consumables',
      notes: 'Assess ICU corridors, public waiting zones, biomedical interface, and shift handover points.',
    },
  },
  {
    id: 3,
    company: 'HITEC Admin Campus',
    contact: 'Farah Ali',
    phone: '+91 98765 21003',
    email: 'farah@hitecadmin.example',
    state: 'Telangana',
    city: 'Hyderabad',
    location: 'HITEC City Admin Tower',
    source: 'Site Visit Planned',
    officer: 'Lakshmi Devi',
    scheduledDate: '18 May 2026',
    status: 'Active',
    estimate: {
      floors: '7',
      area: '1,12,000 sqft',
      housekeeping: '48 staff across two primary shifts',
      security: '24 guards with lobby and parking coverage',
      equipment: 'Walk-behind scrubbers, housekeeping carts, high-access kits',
      consumables: 'Standard office facility consumables with monthly review',
      notes: 'Validate parking basement, reception traffic, and executive floor cleaning windows.',
    },
  },
];

function EstimateField({ label, value, onChange, multiline = false }) {
  const fieldClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium leading-5 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200';

  return (
    <label className="block">
      <span className="text-sm font-semibold leading-5 text-slate-700 dark:text-slate-300">{label}</span>
      {multiline ? (
        <textarea className={`${fieldClass} min-h-28 resize-none`} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

export default function Sites() {
  const [selectedVisitId, setSelectedVisitId] = useState(plannedSiteVisits[0].id);
  const [query, setQuery] = useState('');
  const [estimateByVisit, setEstimateByVisit] = useState(() =>
    plannedSiteVisits.reduce((acc, visit) => ({ ...acc, [visit.id]: visit.estimate }), {}),
  );
  const [successMessage, setSuccessMessage] = useState('');
  usePageTitle('Site Visit & Estimation');

  const selectedVisit = plannedSiteVisits.find((visit) => visit.id === selectedVisitId) || plannedSiteVisits[0];
  const selectedEstimate = estimateByVisit[selectedVisit.id];

  const filteredVisits = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return plannedSiteVisits;
    return plannedSiteVisits.filter((visit) =>
      [visit.company, visit.contact, visit.state, visit.city, visit.officer, visit.status].some((item) =>
        String(item).toLowerCase().includes(value),
      ),
    );
  }, [query]);

  function updateEstimate(key, value) {
    setEstimateByVisit((current) => ({
      ...current,
      [selectedVisit.id]: {
        ...current[selectedVisit.id],
        [key]: value,
      },
    }));
  }

  function saveEstimate() {
    setSuccessMessage('Site visit estimate saved successfully');
    window.setTimeout(() => setSuccessMessage(''), 2600);
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Site Visit & Estimation"
        description="Plan site surveys from confirmed leads, capture facility scope, and prepare the requirement estimate before commercial review."
        actions={
          <button
            type="button"
            onClick={saveEstimate}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700"
          >
            Save estimate <Save className="h-4 w-4" />
          </button>
        }
      />

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
        <div className="enterprise-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Planned Site Visits</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Converted leads ready for survey and assessment.</p>
            </div>
            <span className="rounded-full bg-qpms-50 px-3 py-1 text-xs font-bold text-qpms-700 dark:bg-qpms-500/15 dark:text-qpms-200">
              {plannedSiteVisits.length}
            </span>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search visits..."
              className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          <div className="mt-4 space-y-3">
            {filteredVisits.map((visit) => (
              <button
                type="button"
                key={visit.id}
                onClick={() => setSelectedVisitId(visit.id)}
                className={[
                  'w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5',
                  selectedVisit.id === visit.id
                    ? 'border-qpms-300 bg-qpms-50 shadow-[0_16px_42px_rgba(36,68,164,0.12)] dark:border-qpms-500/40 dark:bg-qpms-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/55 dark:hover:border-slate-700',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950 dark:text-white">{visit.company}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{visit.city}, {visit.state}</p>
                  </div>
                  <StatusBadge status={visit.status} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {visit.scheduledDate} · {visit.officer}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="enterprise-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-qpms-600" />
                  <h2 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">{selectedVisit.company}</h2>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {selectedVisit.source} · {selectedVisit.contact} · {selectedVisit.phone} · {selectedVisit.email}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-slate-950/55 dark:text-slate-300">
                Survey Officer: {selectedVisit.officer}
              </div>
            </div>
            <div className="mt-6">
              <StageTracker stages={siteVisitStages} currentStage="Site Survey / Assessment" />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
            <div className="enterprise-card p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <EstimateField label="Floors" value={selectedEstimate.floors} onChange={(value) => updateEstimate('floors', value)} />
                <EstimateField label="Area / Sqft" value={selectedEstimate.area} onChange={(value) => updateEstimate('area', value)} />
                <EstimateField label="HK Requirement" value={selectedEstimate.housekeeping} onChange={(value) => updateEstimate('housekeeping', value)} />
                <EstimateField label="Security Requirement" value={selectedEstimate.security} onChange={(value) => updateEstimate('security', value)} />
                <EstimateField label="Equipment Requirement" value={selectedEstimate.equipment} onChange={(value) => updateEstimate('equipment', value)} />
                <EstimateField label="Consumables" value={selectedEstimate.consumables} onChange={(value) => updateEstimate('consumables', value)} />
                <div className="md:col-span-2">
                  <EstimateField label="Special Notes" value={selectedEstimate.notes} onChange={(value) => updateEstimate('notes', value)} multiline />
                </div>
              </div>
            </div>

            <div className="enterprise-card p-6">
              <h2 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">Site Photos</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Photo upload placeholders for survey evidence.</p>
              <div className="mt-5 grid gap-3">
                {['Entrance', 'Service Area', 'Equipment Scope'].map((item) => (
                  <div key={item} className="flex h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-950/55">
                    <Camera className="h-5 w-5" />
                    <span className="mt-2 text-xs font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
