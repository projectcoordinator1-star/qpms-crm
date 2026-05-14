import { useState } from 'react';
import { Search } from 'lucide-react';
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
  dashboardDetailSections,
  leadSourceDistribution,
  leadStageFunnel,
  monthlyLeadTrend,
  newBusinessKpis,
  operationsDetailSections,
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

function getDetailColumns(columns) {
  return columns.map((column) => {
    if (['status', 'reviewStatus'].includes(column.key)) {
      return { ...column, render: (row) => <StatusBadge status={row[column.key]} /> };
    }

    return column;
  });
}

function DrilldownChart({ sectionId }) {
  const chartBySection = {
    openLeads: (
      <PieChart>
        <Pie data={leadSourceDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
          {leadSourceDistribution.map((entry, index) => (
            <Cell key={entry.name} fill={sourceColors[index]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    ),
    siteVisitsPlanned: (
      <LineChart data={siteVisitTrend}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="visits" stroke="#2444a4" strokeWidth={3} name="Scheduled Visits" />
        <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed Visits" />
      </LineChart>
    ),
    estimationsPending: (
      <BarChart data={[
        { type: 'Housekeeping', count: 18 },
        { type: 'Security', count: 13 },
        { type: 'Equipment', count: 9 },
        { type: 'Consumables', count: 7 },
      ]}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="type" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill="#7c3aed" radius={[10, 10, 0, 0]} name="Pending Items" />
      </BarChart>
    ),
    commercialReviews: (
      <PieChart>
        <Pie data={[
          { name: 'Costing Review', value: 5 },
          { name: 'Margin Review', value: 4 },
          { name: 'Manpower Review', value: 3 },
          { name: 'Final Remarks', value: 1 },
        ]} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
          {['#f59e0b', '#2444a4', '#85adff', '#10b981'].map((color) => (
            <Cell key={color} fill={color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    ),
    approvalPending: (
      <BarChart data={[
        { level: 'Finance', count: 3 },
        { level: 'COO', count: 4 },
        { level: 'MD', count: 2 },
        { level: 'Branch Head', count: 1 },
      ]} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid stroke={chartGrid} horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis dataKey="level" type="category" width={94} tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill="#ef4444" radius={[0, 10, 10, 0]} name="Pending Approvals" />
      </BarChart>
    ),
    proposalsSent: (
      <AreaChart data={proposalConversionTrend}>
        <defs>
          <linearGradient id="drillProposalSent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f82fb" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#4f82fb" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="sent" stroke="#4f82fb" strokeWidth={2.5} fill="url(#drillProposalSent)" name="Follow-up Trend" />
      </AreaChart>
    ),
    convertedLeads: (
      <AreaChart data={proposalConversionTrend}>
        <defs>
          <linearGradient id="drillConverted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2.5} fill="url(#drillConverted)" name="Converted Leads" />
      </AreaChart>
    ),
  };

  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        {chartBySection[sectionId]}
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function OperationsDrilldownChart({ sectionId }) {
  const chartBySection = {
    activeSites: (
      <BarChart data={stateOperationsSummary}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="activeSites" fill="#2444a4" radius={[10, 10, 0, 0]} name="Active Sites" />
      </BarChart>
    ),
    fieldOfficersActive: (
      <BarChart data={stateOperationsSummary}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="officers" fill="#10b981" radius={[10, 10, 0, 0]} name="Field Officers" />
      </BarChart>
    ),
    attendanceCaptured: (
      <ComposedChart data={stateOperationsSummary}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="attendance" fill="#10b981" radius={[10, 10, 0, 0]} name="Attendance %" />
        <Line type="monotone" dataKey="visits" stroke="#2444a4" strokeWidth={3} name="Site Visits" />
      </ComposedChart>
    ),
    siteVisitsCompleted: (
      <LineChart data={siteVisitTrend}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed Visits" />
        <Line type="monotone" dataKey="visits" stroke="#2444a4" strokeWidth={3} name="Planned Visits" />
      </LineChart>
    ),
    openTickets: (
      <BarChart data={stateOperationsSummary}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="tickets" fill="#f59e0b" radius={[10, 10, 0, 0]} name="Open Tickets" />
      </BarChart>
    ),
    pendingTasks: (
      <PieChart>
        <Pie data={taskCompletionDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
          {taskCompletionDistribution.map((entry, index) => (
            <Cell key={entry.name} fill={taskColors[index]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    ),
    overdueTasks: (
      <BarChart data={[
        { severity: 'High', count: 12 },
        { severity: 'Medium', count: 14 },
        { severity: 'Low', count: 5 },
      ]}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="severity" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill="#ef4444" radius={[10, 10, 0, 0]} name="Overdue Tasks" />
      </BarChart>
    ),
    avgResolutionTime: (
      <BarChart data={[
        { state: 'Tamil Nadu', hours: 2.75 },
        { state: 'Kerala', hours: 3.1 },
        { state: 'Karnataka', hours: 3.8 },
        { state: 'Telangana', hours: 2.9 },
        { state: 'Andhra Pradesh - 1', hours: 4.2 },
        { state: 'Andhra Pradesh - 2', hours: 5.25 },
      ]}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="hours" fill="#f59e0b" radius={[10, 10, 0, 0]} name="Avg Hours" />
      </BarChart>
    ),
  };

  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        {chartBySection[sectionId]}
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function DashboardDetailPanel({ sectionId, sections, renderChart }) {
  const [query, setQuery] = useState('');
  const detail = sections[sectionId];

  if (!detail) {
    return null;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const rows = normalizedQuery
    ? detail.rows.filter((row) =>
        Object.values(row).some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      )
    : detail.rows;

  return (
    <div key={sectionId} className="animate-[login-fade-up_220ms_ease-out]">
      <ChartCard
        title={detail.title}
        description={detail.description}
        action={
          <div className="relative w-full min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${detail.title.toLowerCase()}...`}
              className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
        }
      >
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-qpms-600 dark:text-qpms-300">{detail.title}</span>
        </div>

        <div className="mb-5">
          {renderChart(sectionId)}
        </div>

        {rows.length ? (
          <DataTable columns={getDetailColumns(detail.columns)} rows={rows} embedded />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950/55">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No matching records found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different company, status, owner, or stage.</p>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

function NewBusinessPipeline({ activeDashboardSection, onSectionChange }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {newBusinessKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            {...kpi}
            isActive={activeDashboardSection === kpi.id}
            onClick={() => onSectionChange(activeDashboardSection === kpi.id ? null : kpi.id)}
          />
        ))}
      </section>

      {activeDashboardSection ? (
        <DashboardDetailPanel
          sectionId={activeDashboardSection}
          sections={dashboardDetailSections}
          renderChart={(sectionId) => <DrilldownChart sectionId={sectionId} />}
        />
      ) : (
        <div className="space-y-6 animate-[login-fade-up_220ms_ease-out]">
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
      )}
    </div>
  );
}

function ExistingBusinessOperations({ activeOperationsSection, onSectionChange }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {existingOperationsKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            {...kpi}
            isActive={activeOperationsSection === kpi.id}
            onClick={() => onSectionChange(activeOperationsSection === kpi.id ? null : kpi.id)}
          />
        ))}
      </section>

      {activeOperationsSection ? (
        <DashboardDetailPanel
          sectionId={activeOperationsSection}
          sections={operationsDetailSections}
          renderChart={(sectionId) => <OperationsDrilldownChart sectionId={sectionId} />}
        />
      ) : (
        <div className="space-y-6 animate-[login-fade-up_220ms_ease-out]">
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
      )}
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('new-business');
  const [activeDashboardSection, setActiveDashboardSection] = useState(null);
  const [activeOperationsSection, setActiveOperationsSection] = useState(null);
  usePageTitle('Dashboard');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Operations Command Center"
        description="Management dashboard for new business pipeline health, site operations, attendance, tickets, tasks, field officers, and SLA visibility."
        actions={<DashboardTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />}
      />

      {activeTab === 'new-business' ? (
        <NewBusinessPipeline
          activeDashboardSection={activeDashboardSection}
          onSectionChange={setActiveDashboardSection}
        />
      ) : (
        <ExistingBusinessOperations
          activeOperationsSection={activeOperationsSection}
          onSectionChange={setActiveOperationsSection}
        />
      )}
    </div>
  );
}
