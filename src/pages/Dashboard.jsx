import { ArrowUpRight, Building2, CheckCircle2, Clock3, IndianRupee, TicketCheck } from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { formatCurrency, formatNumber } from '../utils/formatters.js';

const kpis = [
  { title: 'Active Accounts', value: formatNumber(248), change: '+12.4% this month', icon: Building2, tone: 'blue' },
  { title: 'Open Tickets', value: formatNumber(72), change: '+8 urgent reviews', icon: TicketCheck, tone: 'amber' },
  { title: 'Task Completion', value: '84%', change: '+6.1% this week', icon: CheckCircle2, tone: 'green' },
  { title: 'Pipeline Value', value: formatCurrency(4250000), change: '+18.2% forecast', icon: IndianRupee, tone: 'violet' },
];

const activities = [
  ['Site audit completed', 'North Zone Retail Hub', 'Completed'],
  ['Ticket escalated', 'Generator maintenance SLA', 'Escalated'],
  ['New opportunity added', 'Facility expansion proposal', 'Active'],
  ['Employee task assigned', 'Quarterly compliance checklist', 'Pending'],
];

export default function Dashboard() {
  usePageTitle('Dashboard');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        description="A unified command center for QPMS customer operations, field teams, ticket health, and commercial performance."
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            Review pipeline <ArrowUpRight className="h-4 w-4" />
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="enterprise-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Revenue and SLA trend</h2>
              <p className="mt-1 text-sm font-normal leading-6 text-slate-500">Monthly operating performance</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold leading-4 text-emerald-700">Healthy</span>
          </div>
          <div className="mt-8 flex h-72 items-end gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4">
            {[42, 58, 52, 68, 74, 64, 82, 78, 88, 84, 91, 96].map((height, index) => (
              <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-qpms-600 to-qpms-300 shadow-sm"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs font-medium leading-4 text-slate-400">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="enterprise-card p-6">
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Quick stats</h2>
          <div className="mt-5 space-y-3">
            {[
              ['Avg response', '1h 24m'],
              ['Site uptime', '99.2%'],
              ['Pending approvals', '18'],
              ['Team utilization', '76%'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3.5">
                <span className="text-sm font-medium leading-5 text-slate-600">{label}</span>
                <span className="text-sm font-semibold leading-5 text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="enterprise-card p-6">
        <div className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-qpms-600" />
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Recent activity</h2>
        </div>
        <div className="mt-5 divide-y divide-slate-100">
          {activities.map(([title, detail, status]) => (
            <div key={title} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold leading-5 text-slate-950">{title}</p>
                <p className="mt-1 text-sm font-normal leading-6 text-slate-500">{detail}</p>
              </div>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
