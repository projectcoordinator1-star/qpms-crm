import { useMemo, useState } from 'react';
import {
  ChevronRight,
  ClipboardList,
  MapPinned,
  RadioTower,
  Route,
  Search,
  ShieldAlert,
  TicketCheck,
  UserRoundCheck,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { fieldOfficerActivity, stateOperationsSummary } from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const mapPositions = {
  'Tamil Nadu': { left: '60%', top: '73%' },
  Kerala: { left: '42%', top: '80%' },
  Karnataka: { left: '39%', top: '52%' },
  Telangana: { left: '57%', top: '31%' },
  'Andhra Pradesh - 1': { left: '69%', top: '41%' },
  'Andhra Pradesh - 2': { left: '76%', top: '26%' },
};

function statusTone(status) {
  if (status === 'Active' || status === 'Healthy') return 'bg-emerald-500';
  if (status === 'Offline' || status === 'Critical') return 'bg-rose-500';
  return 'bg-amber-500';
}

function MetricTile({ label, value, icon, tone = 'blue' }) {
  const Icon = icon;
  const tones = {
    blue: 'bg-qpms-50 text-qpms-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold leading-none text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function FOActivities() {
  usePageTitle('FO Activities');
  const [stateFilter, setStateFilter] = useState('All States');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [search, setSearch] = useState('');

  const filteredOfficers = useMemo(() => fieldOfficerActivity.filter((officer) => {
    const stateMatches = stateFilter === 'All States' || officer.state === stateFilter;
    const statusMatches = statusFilter === 'All Status' || officer.status === statusFilter;
    const searchMatches = !search || `${officer.name} ${officer.assignedSite} ${officer.branch}`.toLowerCase().includes(search.toLowerCase());
    return stateMatches && statusMatches && searchMatches;
  }), [search, stateFilter, statusFilter]);

  const filteredStates = stateFilter === 'All States'
    ? stateOperationsSummary
    : stateOperationsSummary.filter((state) => state.state === stateFilter);

  const totals = filteredStates.reduce((summary, state) => ({
    sites: summary.sites + state.activeSites,
    visits: summary.visits + state.visits,
    tickets: summary.tickets + state.tickets,
    tasks: summary.tasks + state.tasks,
    sla: summary.sla + state.sla,
  }), { sites: 0, visits: 0, tickets: 0, tasks: 0, sla: 0 });
  const averageSla = filteredStates.length ? Math.round(totals.sla / filteredStates.length) : 0;
  const activeOfficers = filteredOfficers.filter((officer) => officer.status === 'Active').length;
  const offlineOfficers = filteredOfficers.filter((officer) => officer.status === 'Offline').length;

  return (
    <div className="space-y-5">
      <PageHeader title="Field Operations - Live Tracking" />

      <section className="enterprise-card overflow-hidden">
        <div className="grid gap-px border-b border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="bg-white px-4 py-3 dark:bg-slate-900">
            <span className="block text-[11px] font-bold uppercase text-slate-500">State</span>
            <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none dark:text-slate-100">
              <option>All States</option>
              {stateOperationsSummary.map((item) => <option key={item.id}>{item.state}</option>)}
            </select>
          </label>
          <label className="bg-white px-4 py-3 dark:bg-slate-900">
            <span className="block text-[11px] font-bold uppercase text-slate-500">Officer Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none dark:text-slate-100">
              <option>All Status</option>
              <option>Active</option>
              <option>In Transit</option>
              <option>Pending</option>
              <option>Offline</option>
            </select>
          </label>
          <label className="relative bg-white px-4 py-3 dark:bg-slate-900">
            <span className="block text-[11px] font-bold uppercase text-slate-500">Search</span>
            <Search className="absolute bottom-[18px] left-4 h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Officer or site" className="mt-1 w-full bg-transparent pl-6 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" />
          </label>
          <div className="flex items-center justify-center bg-white px-4 py-3 dark:bg-slate-900">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <RadioTower className="h-3.5 w-3.5" /> Operations snapshot
            </span>
          </div>
        </div>

        <div className="grid min-h-[620px] lg:grid-cols-[400px_minmax(0,1fr)]">
          <div className="space-y-4 border-r border-slate-200 p-4 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <MetricTile label="Active FO" value={activeOfficers} icon={UserRoundCheck} tone="green" />
              <MetricTile label="Offline FO" value={offlineOfficers} icon={ShieldAlert} tone={offlineOfficers ? 'red' : 'green'} />
              <MetricTile label="Site Visits" value={totals.visits} icon={Route} tone="blue" />
              <MetricTile label="Open Tickets" value={totals.tickets} icon={TicketCheck} tone={totals.tickets ? 'amber' : 'green'} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">Field Officers</h2>
                <span className="text-xs font-semibold text-slate-500">{filteredOfficers.length} visible</span>
              </div>
              <div className="max-h-[383px] space-y-2 overflow-y-auto pr-1">
                {filteredOfficers.map((officer) => (
                  <button key={officer.id} type="button" className="focus-ring flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-qpms-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusTone(officer.status)}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">{officer.name}</span>
                      <span className="block truncate text-xs font-medium text-slate-500">{officer.assignedSite} | {officer.branch}</span>
                      <span className="mt-1 block truncate text-[11px] font-semibold text-slate-400">{officer.lastActivity}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">{officer.status}</span>
                      <span className="block text-[11px] font-medium text-slate-400">{officer.checkIn}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
                {!filteredOfficers.length ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm font-medium text-slate-500 dark:border-slate-800">
                    No field officers match these filters.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">South India Field Coverage</h2>
                <p className="text-xs font-medium text-slate-500">State activity and site coverage</p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {stateFilter}
              </span>
            </div>

            <div className="relative min-h-[450px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(130deg,#eff6ff_0%,#e0f2fe_32%,#f8fafc_32%,#eef2ff_100%)] dark:border-slate-800 dark:bg-slate-900">
              <div className="absolute inset-y-0 right-0 w-[28%] bg-sky-100/75 dark:bg-sky-950/20" />
              <div className="absolute left-[21%] top-[11%] h-[80%] w-[51%] rounded-[42%_56%_34%_45%] border border-slate-200/70 bg-white/85 shadow-inner dark:border-slate-700 dark:bg-slate-800/80" />
              <span className="absolute right-8 top-1/2 text-xs font-bold uppercase text-sky-500/60">Bay of Bengal</span>
              {filteredStates.map((state) => {
                const position = mapPositions[state.state];
                return (
                  <div key={state.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={position}>
                    <span className={`grid h-10 w-10 place-items-center rounded-full border-4 border-white text-xs font-bold text-white shadow-lg ${statusTone(state.status)}`}>
                      {state.officers}
                    </span>
                    <span className="mt-1 block whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm">{state.state}</span>
                  </div>
                );
              })}
              <div className="absolute bottom-4 right-4 space-y-2 rounded-xl border border-slate-200 bg-white/94 p-3 shadow-sm">
                {[
                  ['Active', 'bg-emerald-500'],
                  ['Attention', 'bg-amber-500'],
                  ['Critical', 'bg-rose-500'],
                ].map(([label, tone]) => (
                  <p key={label} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${tone}`} /> {label}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricTile label="Active Sites" value={totals.sites} icon={MapPinned} />
              <MetricTile label="SLA Health" value={`${averageSla}%`} icon={RadioTower} tone={averageSla >= 90 ? 'green' : 'amber'} />
              <MetricTile label="Tasks Pending" value={totals.tasks} icon={ClipboardList} tone="amber" />
              <MetricTile label="Visits Today" value={totals.visits} icon={Route} tone="green" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
