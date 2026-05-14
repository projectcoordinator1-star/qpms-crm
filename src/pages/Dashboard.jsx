import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '../components/ChartCard.jsx';
import DashboardTabs from '../components/DashboardTabs.jsx';
import DataTable from '../components/DataTable.jsx';
import KpiCard from '../components/KpiCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  existingOperationsKpis,
  fieldOfficerActivity,
  leadSourceDistribution,
  leadStageFunnel,
  monthlyLeadTrend,
  newBusinessKpis,
  proposalConversionTrend,
  recentLeads,
  siteVisitTrend,
  stateOperationsSummary,
  taskCompletionDistribution,
} from '../data/qpmsWorkflowData.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const tabs = [
  { id: 'new-business', label: 'New Business Pipeline' },
  { id: 'operations', label: 'Existing Business Operations' },
];

const sourceColors = ['#2444a4', '#4f82fb', '#85adff', '#10b981', '#f59e0b', '#ef4444'];
const taskColors = ['#10b981', '#f59e0b', '#ef4444'];
const chartGrid = '#e2e8f0';
const chartText = '#64748b';

const tooltipStyle = {
  borderRadius: 14,
  borderColor: '#e2e8f0',
  boxShadow: '0 18px 45px rgba(15,23,42,0.10)',
  fontSize: 12,
};

const recentLeadColumns = [
  { key: 'company', label: 'Client / Company' },
  { key: 'source', label: 'Source' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'stage', label: 'Stage' },
  { key: 'nextFollowUp', label: 'Next Follow-up' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const operationsColumns = [
  { key: 'state', label: 'State / Region' },
  { key: 'activeSites', label: 'Active Sites' },
  { key: 'officers', label: 'Field Officers' },
  { key: 'attendance', label: 'Attendance %', render: (row) => `${row.attendance}%` },
  { key: 'visits', label: 'Site Visits Today' },
  { key: 'tickets', label: 'Open Tickets' },
  { key: 'tasks', label: 'Pending Tasks' },
  { key: 'sla', label: 'SLA %', render: (row) => `${row.sla}%` },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const officerColumns = [
  { key: 'name', label: 'Name' },
  { key: 'state', label: 'State' },
  { key: 'branch', label: 'Branch' },
  { key: 'checkIn', label: 'Check-in Time' },
  { key: 'lastActivity', label: 'Last Activity', wrap: true },
  { key: 'assignedSite', label: 'Assigned Site' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

function ChartFrame({ children, height = 'h-72' }) {
  return <div className={`${height} rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/55`}>{children}</div>;
}

function NewBusinessPipeline() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {newBusinessKpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <ChartCard title="Lead Source Distribution" description="Where new business demand is entering the pipeline.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadSourceDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                  {leadSourceDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={sourceColors[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Lead Stage Funnel" description="Salesforce-style movement from new lead to converted account.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadStageFunnel} layout="vertical" margin={{ left: 18 }}>
                <CartesianGrid stroke={chartGrid} horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" width={112} tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(36,68,164,0.06)' }} />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} fill="#2444a4" />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Monthly Lead Trend" description="Lead inflow and site visit readiness across the current year.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyLeadTrend}>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="leads" stroke="#2444a4" strokeWidth={3} dot={{ r: 3 }} name="Leads" />
                <Line type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} name="Site Visits" />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Proposal Conversion Trend" description="Proposal volume compared with converted business wins.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={proposalConversionTrend}>
                <defs>
                  <linearGradient id="proposalSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f82fb" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#4f82fb" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="proposalConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="sent" stroke="#4f82fb" strokeWidth={2.5} fill="url(#proposalSent)" name="Proposals Sent" />
                <Area type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2.5} fill="url(#proposalConverted)" name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>
      </section>

      <ChartCard title="Recent Leads" description="Latest opportunities requiring follow-up, estimation, commercial review, or approval action.">
        <DataTable columns={recentLeadColumns} rows={recentLeads} embedded />
      </ChartCard>
    </div>
  );
}

function ExistingBusinessOperations() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {existingOperationsKpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="State-wise Site Performance" description="Active site coverage and field officer distribution.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateOperationsSummary}>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="activeSites" fill="#2444a4" radius={[10, 10, 0, 0]} name="Active Sites" />
                <Bar dataKey="officers" fill="#85adff" radius={[10, 10, 0, 0]} name="Field Officers" />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Attendance by State" description="Captured attendance percentage against today site visits.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stateOperationsSummary}>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="attendance" fill="#10b981" radius={[10, 10, 0, 0]} name="Attendance %" />
                <Line type="monotone" dataKey="visits" stroke="#2444a4" strokeWidth={3} name="Site Visits" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Ticket Volume by State" description="Open operational tickets requiring field or branch action.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateOperationsSummary}>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="tickets" fill="#f59e0b" radius={[10, 10, 0, 0]} name="Open Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Task Completion Distribution" description="Completed, pending, and overdue task visibility.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskCompletionDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                  {taskCompletionDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={taskColors[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Site Visit Trend" description="Planned visits versus completed visits across the current week.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={siteVisitTrend}>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="visits" stroke="#2444a4" strokeWidth={3} name="Planned Visits" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed Visits" />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="SLA Performance by State" description="Service-level health across operating regions.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={stateOperationsSummary}>
                <PolarGrid stroke={chartGrid} />
                <PolarAngleAxis dataKey="state" tick={{ fill: chartText, fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[70, 100]} tick={{ fill: chartText, fontSize: 11 }} />
                <Radar name="SLA %" dataKey="sla" stroke="#2444a4" fill="#4f82fb" fillOpacity={0.35} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>
      </section>

      <ChartCard title="State-wise Operations Summary" description="Management view of sites, officers, attendance, tickets, tasks, SLA, and operating status.">
        <DataTable columns={operationsColumns} rows={stateOperationsSummary} embedded />
      </ChartCard>

      <ChartCard title="Field Officer Activity" description="Live-style mock activity feed for officers working across QPMS branches and assigned sites.">
        <DataTable columns={officerColumns} rows={fieldOfficerActivity} embedded />
      </ChartCard>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('new-business');
  usePageTitle('Dashboard');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Operations Command Center"
        description="Management dashboard for new business pipeline health, site operations, attendance, tickets, tasks, field officers, and SLA visibility."
        actions={<DashboardTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />}
      />

      {activeTab === 'new-business' ? <NewBusinessPipeline /> : <ExistingBusinessOperations />}
    </div>
  );
}
