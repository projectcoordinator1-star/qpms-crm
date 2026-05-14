import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import KpiCard from '../components/KpiCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import StageTracker from '../components/StageTracker.jsx';
import {
  dashboardKpis,
  pipelineData,
  proposalData,
  recentWorkflowActivity,
  workflowStages,
} from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const proposalColors = ['#2444a4', '#4f82fb', '#85adff', '#10b981'];

export default function Dashboard() {
  usePageTitle('Dashboard');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Operations Dashboard"
        description="Salesforce-style command center for QPMS lead flow, site visits, commercial review, approvals, and proposals."
        actions={
          <button className="focus-ring inline-flex items-center gap-2 rounded-xl bg-qpms-600 px-4 py-2.5 text-sm font-semibold leading-5 text-white shadow-lg shadow-qpms-600/20 hover:bg-qpms-700">
            Review workflow <ArrowUpRight className="h-4 w-4" />
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="enterprise-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Lead to proposal pipeline</h2>
              <p className="mt-1 text-sm font-normal leading-6 text-slate-500">Operational workflow volume by stage</p>
            </div>
            <span className="rounded-full bg-qpms-50 px-3 py-1 text-xs font-semibold leading-4 text-qpms-700">Live mock data</span>
          </div>
          <div className="mt-8 h-72 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(36,68,164,0.06)' }}
                  contentStyle={{ borderRadius: 14, borderColor: '#e2e8f0', boxShadow: '0 18px 45px rgba(15,23,42,0.10)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#2444a4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="enterprise-card p-6">
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Proposal status</h2>
          <p className="mt-1 text-sm font-normal leading-6 text-slate-500">Current quotation movement</p>
          <div className="mt-6 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={proposalData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                  {proposalData.map((entry, index) => (
                    <Cell key={entry.name} fill={proposalColors[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {proposalData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: proposalColors[index] }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="enterprise-card p-6">
        <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Approval workflow tracker</h2>
        <p className="mt-1 text-sm font-normal leading-6 text-slate-500">Reference stage path for lead conversion and proposal approvals.</p>
        <div className="mt-6">
          <StageTracker stages={workflowStages} currentStage="Approval Pending" />
        </div>
      </section>

      <section className="enterprise-card p-6">
        <div className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-qpms-600" />
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950">Recent activity</h2>
        </div>
        <div className="mt-5 divide-y divide-slate-100">
          {recentWorkflowActivity.map(([title, detail, status]) => (
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
