import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Layers3,
  MessageSquareWarning,
  Search,
  TimerReset,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
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
import { useAuth } from '../context/auth-context.js';
import { useWorkflow } from '../context/workflow-context.js';
import { bdExecutives, canViewBdTeam, isCommercialTeam, isCoordinator, isFinanceTeam, isHrReviewer, isOperationsTeam } from '../data/mockUsers.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const tabs = [
  { id: 'new-business', label: 'New Business Pipeline' },
  { id: 'operations', label: 'Existing Business Operations' },
];

const reviewTabs = [
  { id: 'new-business', label: 'Review Command Center' },
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

function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

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

const bdOverviewColumns = [
  { key: 'executive', label: 'BD Executive' },
  { key: 'totalLeads', label: 'Total Leads' },
  { key: 'leadMomSent', label: 'Lead MOM Sent' },
  { key: 'siteVisitsScheduled', label: 'Site Visits Scheduled' },
  { key: 'commercialPending', label: 'Commercial Pending' },
  { key: 'financePending', label: 'Finance Pending' },
  { key: 'cooPending', label: 'COO Pending' },
];

const workflowStageOwners = {
  'Operations Review': 'Operations Team',
  'Coordinator Costing Review': 'Coordinator',
  'HR Validation': 'HR Reviewer',
  'Commercial Review': 'Commercial Reviewer',
  'Finance Review': 'Finance Reviewer',
};

const reviewerScopeMatrix = {
  'Operations Review': {
    editable: 6,
    viewOnly: 5,
    hidden: 4,
    rows: [
      { area: 'Tools / Equipment', access: 'Editable', count: 18 },
      { area: 'Operational Feasibility', access: 'Editable', count: 12 },
      { area: 'Site Readiness', access: 'Editable', count: 9 },
      { area: 'Commercial Costing', access: 'Hidden', count: 6 },
      { area: 'HR Costing', access: 'Hidden', count: 5 },
    ],
  },
  'Coordinator Costing Review': {
    editable: 5,
    viewOnly: 7,
    hidden: 3,
    rows: [
      { area: 'Manpower Consolidation', access: 'Editable', count: 14 },
      { area: 'Reliever Logic', access: 'Editable', count: 8 },
      { area: 'Zone Logic', access: 'Editable', count: 6 },
      { area: 'Operations Scope', access: 'View Only', count: 11 },
      { area: 'Finance Approval', access: 'Hidden', count: 3 },
    ],
  },
  'HR Validation': {
    editable: 5,
    viewOnly: 4,
    hidden: 6,
    rows: [
      { area: 'Manpower Wages', access: 'Editable', count: 16 },
      { area: 'Shift / Gender', access: 'Editable', count: 10 },
      { area: 'Uniform Logic', access: 'Editable', count: 7 },
      { area: 'Commercial Statement', access: 'Hidden', count: 6 },
      { area: 'Finance Approval', access: 'Hidden', count: 4 },
    ],
  },
  'Commercial Review': {
    editable: 4,
    viewOnly: 10,
    hidden: 1,
    rows: [
      { area: 'Pricing', access: 'Editable', count: 10 },
      { area: 'Margins', access: 'Editable', count: 8 },
      { area: 'Management Fee', access: 'Editable', count: 5 },
      { area: 'Assessment Summary', access: 'View Only', count: 15 },
      { area: 'Finance Approval', access: 'Hidden', count: 2 },
    ],
  },
  'Finance Review': {
    editable: 4,
    viewOnly: 9,
    hidden: 2,
    rows: [
      { area: 'Payment Terms', access: 'Editable', count: 8 },
      { area: 'Budget Feasibility', access: 'Editable', count: 7 },
      { area: 'Finance Remarks', access: 'Editable', count: 9 },
      { area: 'Commercial Costing', access: 'View Only', count: 12 },
      { area: 'Operations Inputs', access: 'View Only', count: 11 },
    ],
  },
};

const healthTone = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20',
};

function positiveCount(value, fallback) {
  const number = Number(value || 0);
  return number > 0 ? number : fallback;
}

function roleScope(user) {
  if (['Admin', 'COO'].includes(user?.role)) return 'admin';
  if (['BD Head', 'BD Executive'].includes(user?.role)) return 'bd';
  if (isCommercialTeam(user)) return 'commercial';
  if (isFinanceTeam(user)) return 'finance';
  if (isHrReviewer(user)) return 'hr';
  if (isOperationsTeam(user)) return 'operations';
  if (isCoordinator(user)) return 'coordinator';
  return 'admin';
}

function reviewCount(siteVisits, stage, status = 'Pending') {
  return siteVisits.filter((visit) => (visit.reviewStatus?.[stage] || (visit.currentStage === stage ? 'Pending' : '')) === status).length;
}

function buildCommandCenterData({ user, leads, siteVisits, stage }) {
  const scope = roleScope(user);
  const pendingCommercial = reviewCount(siteVisits, 'Commercial Review');
  const pendingFinance = reviewCount(siteVisits, 'Finance Review');
  const pendingOperations = reviewCount(siteVisits, 'Operations Review');
  const pendingHr = reviewCount(siteVisits, 'HR Validation');
  const proposalsDue = leads.filter((lead) => ['Proposal', 'Proposal Due', 'Proposal Pending'].includes(lead.stage)).length;
  const converted = leads.filter((lead) => lead.stage === 'Converted').length;
  const pendingApprovals = pendingCommercial + pendingFinance + pendingOperations + pendingHr + reviewCount(siteVisits, 'Coordinator Costing Review');
  const siteVisitsToday = siteVisits.filter((visit) => ['Scheduled', 'Pending Review', 'Site Visit MOM Sent'].includes(visit.status)).length;
  const operationalVisits = stage ? reviewCount(siteVisits, stage) : pendingApprovals;
  const employeeFocus = scope === 'hr';
  const commercialFocus = scope === 'commercial';
  const financeFocus = scope === 'finance';
  const operationsFocus = scope === 'operations';

  const baseTodayOperations = [
    { label: 'Site Visits Today', value: positiveCount(siteVisitsToday, operationsFocus ? 8 : 6), icon: CalendarCheck2, tone: 'blue' },
    { label: 'Approvals Pending', value: positiveCount(stage ? reviewCount(siteVisits, stage) : pendingApprovals, commercialFocus || financeFocus ? 4 : 9), icon: Clock3, tone: 'amber' },
    { label: 'Proposals Due', value: positiveCount(proposalsDue, financeFocus ? 7 : 3), icon: FileText, tone: 'violet' },
    { label: 'Employee Check-ins', value: employeeFocus ? 286 : 238, icon: UserCheck, tone: 'green' },
    { label: 'Field Tasks Pending', value: operationsFocus ? positiveCount(operationalVisits, 12) : 18, icon: ClipboardList, tone: 'amber' },
    { label: 'Client Escalations', value: operationsFocus ? 5 : 3, icon: MessageSquareWarning, tone: 'red' },
  ];
  const todayOperationsByScope = {
    commercial: [
      { label: 'Commercial Reviews', value: positiveCount(pendingCommercial, 4), icon: BriefcaseBusiness, tone: 'amber' },
      { label: 'Pricing Due', value: 6, icon: FileText, tone: 'violet' },
      { label: 'Margin Exceptions', value: 2, icon: AlertTriangle, tone: 'red' },
      { label: 'Proposals Due', value: positiveCount(proposalsDue, 5), icon: ClipboardList, tone: 'blue' },
      { label: 'Approved Today', value: 3, icon: CheckCircle2, tone: 'green' },
      { label: 'Client Escalations', value: 2, icon: MessageSquareWarning, tone: 'red' },
    ],
    finance: [
      { label: 'Finance Approvals', value: positiveCount(pendingFinance, 3), icon: Clock3, tone: 'amber' },
      { label: 'Proposal Value Queue', value: formatInr(8400000), icon: FileText, tone: 'blue' },
      { label: 'Payment Terms Due', value: 5, icon: ClipboardList, tone: 'violet' },
      { label: 'Budget Exceptions', value: 2, icon: AlertTriangle, tone: 'red' },
      { label: 'Approved Today', value: 4, icon: CheckCircle2, tone: 'green' },
      { label: 'Escalations', value: 1, icon: MessageSquareWarning, tone: 'amber' },
    ],
    hr: [
      { label: 'Manpower Reviews', value: positiveCount(pendingHr, 4), icon: Users, tone: 'amber' },
      { label: 'Employee Check-ins', value: 286, icon: UserCheck, tone: 'green' },
      { label: 'Wage Validations', value: 7, icon: ClipboardList, tone: 'blue' },
      { label: 'Shift Exceptions', value: 3, icon: AlertTriangle, tone: 'red' },
      { label: 'Uniform Checks', value: 9, icon: FileText, tone: 'violet' },
      { label: 'Pending Escalations', value: 2, icon: MessageSquareWarning, tone: 'amber' },
    ],
  };
  const todayOperations = todayOperationsByScope[scope] || baseTodayOperations;

  const actions = [
    { label: 'Commercial reviews pending', count: positiveCount(pendingCommercial, commercialFocus ? 4 : 2), priority: 'High', cta: 'Review', scope: ['admin', 'commercial'] },
    { label: 'Finance approvals pending', count: positiveCount(pendingFinance, financeFocus ? 3 : 2), priority: 'High', cta: 'Review', scope: ['admin', 'finance'] },
    { label: 'COO approvals pending', count: 2, priority: 'Medium', cta: 'Open', scope: ['admin', 'bd', 'finance'] },
    { label: 'Site visits overdue', count: operationsFocus ? 5 : 3, priority: 'High', cta: 'Assign', scope: ['admin', 'bd', 'operations'] },
    { label: 'Proposals not sent', count: positiveCount(proposalsDue, 6), priority: 'Medium', cta: 'Open', scope: ['admin', 'bd', 'commercial', 'finance'] },
    { label: 'Leads stuck in same stage', count: positiveCount(leads.filter((lead) => ['Contacted', 'MOM Pending'].includes(lead.stage)).length, 5), priority: 'Low', cta: 'Assign', scope: ['admin', 'bd'] },
    { label: 'Manpower validation pending', count: positiveCount(pendingHr, 4), priority: 'High', cta: 'Review', scope: ['admin', 'hr', 'coordinator'] },
  ].filter((item) => item.scope.includes(scope)).slice(0, 6);

  const recentActivity = [
    { event: 'Lead moved to Site Visit', detail: leads[0]?.company || 'Metro Retail Parks', time: '10 mins ago' },
    { event: 'MOM generated', detail: siteVisits[0]?.company || 'Aster Medcity', time: '22 mins ago' },
    { event: `${stage || 'Commercial Review'} updated`, detail: siteVisits[1]?.company || 'Port Admin Block', time: '38 mins ago' },
    { event: 'Finance approved', detail: 'Emirates Facility Zone', time: '1 hr ago' },
    { event: 'Proposal sent', detail: leads.find((lead) => lead.stage === 'Proposal Sent')?.company || 'Nova Tech Park', time: '2 hrs ago' },
    { event: employeeFocus ? 'Employee checked in' : 'Lead converted', detail: employeeFocus ? 'South Zone supervisor' : leads.find((lead) => lead.stage === 'Converted')?.company || 'Green Square Mall', time: '3 hrs ago' },
  ];

  const operationalHealth = [
    { label: 'Proposal TAT', value: '2.4 days', tone: 'green', helper: 'Target 3 days' },
    { label: 'Approval TAT', value: '18 hrs', tone: pendingApprovals > 8 ? 'yellow' : 'green', helper: 'Current workflow' },
    { label: 'Site Visit Completion', value: '86%', tone: 'green', helper: 'Weekly run rate' },
    { label: 'Lead Conversion', value: `${Math.max(12, Math.round((converted / Math.max(leads.length, 1)) * 100))}%`, tone: 'yellow', helper: 'Pipeline quality' },
    { label: 'Attendance Compliance', value: employeeFocus ? '94%' : '91%', tone: 'green', helper: 'Today check-ins' },
    { label: 'Pending Escalations', value: operationsFocus ? '5' : '3', tone: operationsFocus ? 'yellow' : 'green', helper: 'Client actions' },
  ];

  return { todayOperations, actions, recentActivity, operationalHealth };
}

function ChartFrame({ children, height = 'h-72' }) {
  return <div className={`${height} min-w-0 overflow-hidden rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/55`}>{children}</div>;
}

function compactTone(tone) {
  return {
    blue: 'bg-qpms-50 text-qpms-700 ring-qpms-200 dark:bg-qpms-500/15 dark:text-qpms-300 dark:ring-qpms-500/20',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/20',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/20',
    red: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20',
  }[tone] || 'bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700';
}

function priorityClass(priority) {
  return {
    High: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/25',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25',
    Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25',
  }[priority];
}

function QuickActionBar({ user }) {
  const scope = roleScope(user);
  const actions = [
    { label: 'New Lead', icon: BriefcaseBusiness, scopes: ['admin', 'bd'] },
    { label: 'Schedule Site Visit', icon: CalendarCheck2, scopes: ['admin', 'bd', 'operations'] },
    { label: 'Generate Proposal', icon: FileText, scopes: ['admin', 'bd', 'commercial', 'finance'] },
    { label: 'Open Approvals', icon: CheckCircle2, scopes: ['admin', 'commercial', 'finance', 'operations', 'hr', 'coordinator'] },
    { label: 'Add Employee', icon: UserPlus, scopes: ['admin', 'hr'] },
    { label: 'Export Report', icon: Download, scopes: ['admin', 'bd', 'commercial', 'finance', 'operations', 'hr', 'coordinator'] },
  ].filter((action) => action.scopes.includes(scope));

  return (
    <section className="enterprise-card flex flex-wrap items-center gap-2 p-3 sm:p-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-qpms-200 hover:bg-qpms-50 hover:text-qpms-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-qpms-500/40 dark:hover:bg-qpms-500/10"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </button>
        );
      })}
    </section>
  );
}

function TodayOperations({ items }) {
  return (
    <ChartCard title="Today's Operations" description="Live-style operational pulse for current CRM and field workflow.">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex min-h-20 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/55">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase leading-4 tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-1 text-xl font-semibold leading-none text-slate-950 dark:text-white">{item.value}</p>
              </div>
              <div className={`shrink-0 rounded-xl p-2 ring-1 ${compactTone(item.tone)}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

function ActionCenter({ actions }) {
  return (
    <ChartCard title="Pending Alerts" description="Items requiring COO/management attention.">
      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.label} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950 dark:text-white">{action.label}</p>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${priorityClass(action.priority)}`}>{action.priority}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{action.count} records need attention</p>
            </div>
            <button type="button" className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl bg-qpms-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-qpms-700">
              {action.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function RecentActivityFeed({ items }) {
  return (
    <ChartCard title="Recent Activity Feed" description="Latest CRM and operational workflow movements.">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.event}-${item.time}`} className="flex gap-3">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-qpms-500 shadow-[0_0_0_4px_rgba(79,130,251,0.14)]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.event}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.detail}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function OperationalHealth({ items }) {
  return (
    <ChartCard title="Operational Health / SLA Insights" description="Management indicators for turnaround, compliance, conversion, and risk.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-2xl p-4 ring-1 ${healthTone[item.tone]}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold leading-none">{item.value}</p>
                <p className="mt-2 text-xs font-semibold opacity-80">{item.helper}</p>
              </div>
              <TimerReset className="h-5 w-5 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function CommandCenterOverview({ user, leads, siteVisits, stage }) {
  const data = useMemo(() => buildCommandCenterData({ user, leads, siteVisits, stage }), [user, leads, siteVisits, stage]);
  const isExecutiveView = ['Admin', 'COO'].includes(user?.role);

  return (
    <div className="space-y-6">
      {isExecutiveView ? null : <QuickActionBar user={user} />}
      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <TodayOperations items={data.todayOperations} />
        <ActionCenter actions={data.actions} />
      </section>
      <RecentActivityFeed items={data.recentActivity} />
      <OperationalHealth items={data.operationalHealth} />
    </div>
  );
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
  const summaryTotal = detail.amountKey
    ? detail.rows.reduce((total, row) => total + Number(row[detail.amountKey] || 0), 0)
    : null;

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

        {detail.summaryLabel ? (
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-qpms-100 bg-qpms-50 p-4 dark:border-qpms-500/20 dark:bg-qpms-500/10">
              <p className="text-xs font-semibold uppercase text-qpms-700 dark:text-qpms-200">{detail.summaryLabel}</p>
              <p className="mt-2 text-2xl font-semibold leading-none text-slate-950 dark:text-white">
                {formatInr(summaryTotal)}
              </p>
            </div>
          </div>
        ) : null}

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

function NewBusinessPipeline({ activeDashboardSection, onSectionChange, visibleLeads, visibleSiteVisits, user }) {
  const roleAwareKpis = useMemo(() => {
    const openLeads = visibleLeads.filter((lead) => !['Converted', 'Lost'].includes(lead.stage));
    const siteVisitsScheduled = visibleLeads.filter((lead) => lead.stage === 'Site Visit Scheduled').length || visibleSiteVisits.length;
    const commercialPending = visibleLeads.filter((lead) => lead.stage === 'Commercial Review').length + visibleSiteVisits.filter((visit) => visit.currentStage === 'Commercial Review' || visit.status === 'Commercial Review').length;
    const financePending = visibleLeads.filter((lead) => lead.stage === 'Finance Validation').length;
    const bdPending = visibleLeads.filter((lead) => ['BD Team Review', 'Approval Pending'].includes(lead.stage)).length;
    const cooPending = visibleLeads.filter((lead) => lead.pendingWith === 'COO' || lead.stage === 'COO Approval').length;
    const proposals = visibleLeads.filter((lead) => lead.stage === 'Proposal Sent').length;
    const converted = visibleLeads.filter((lead) => lead.stage === 'Converted').length;

    return newBusinessKpis.map((kpi) => {
      const valueById = {
        openLeads: openLeads.length,
        siteVisitsPlanned: siteVisitsScheduled,
        estimationsPending: visibleSiteVisits.filter((visit) => ['Scheduled', 'Site Visit MOM Created', 'Site Visit MOM Sent'].includes(visit.status)).length,
        commercialReviews: commercialPending,
        approvalPending: bdPending + financePending + cooPending,
        proposalsSent: proposals,
        convertedLeads: converted,
      };
      const changeById = {
        openLeads: user?.role === 'BD Executive' ? 'Only your assigned leads' : 'Visible by current role',
        siteVisitsPlanned: 'Scheduled from Lead MOMs',
        estimationsPending: 'Site assessment queue',
        commercialReviews: 'Pending commercial review',
        approvalPending: `Finance ${financePending} / BD ${bdPending} / COO ${cooPending}`,
        proposalsSent: kpi.change,
        convertedLeads: kpi.change,
      };
      return { ...kpi, value: String(valueById[kpi.id] ?? kpi.value), change: changeById[kpi.id] || kpi.change };
    });
  }, [user, visibleLeads, visibleSiteVisits]);

  const recentVisibleLeads = useMemo(
    () =>
      visibleLeads.slice(0, 8).map((lead) => ({
        id: lead.id,
        company: lead.company,
        source: lead.source,
        assignedTo: lead.assigned_bd_executive || lead.executive,
        stage: lead.stage,
        nextFollowUp: lead.followUp || lead.scheduledVisitDate || 'Not scheduled',
        status: lead.status,
      })),
    [visibleLeads],
  );

  const bdTeamOverview = useMemo(
    () =>
      bdExecutives.map((executive) => {
        const executiveLeads = visibleLeads.filter((lead) => lead.assigned_bd_email === executive.email || lead.assigned_bd_executive === executive.name);
        const executiveVisits = visibleSiteVisits.filter((visit) => visit.assigned_bd_email === executive.email || visit.assigned_bd_executive === executive.name);
        return {
          id: executive.id,
          executive: executive.name,
          totalLeads: executiveLeads.length,
          leadMomSent: executiveLeads.filter((lead) => ['Site Visit Scheduled', 'Lead MOM Sent'].includes(lead.stage) || lead.mom?.sent).length,
          siteVisitsScheduled: executiveVisits.length,
          commercialPending: executiveLeads.filter((lead) => lead.stage === 'Commercial Review').length + executiveVisits.filter((visit) => visit.currentStage === 'Commercial Review').length,
          financePending: executiveLeads.filter((lead) => lead.stage === 'Finance Validation').length,
          cooPending: executiveLeads.filter((lead) => lead.pendingWith === 'COO' || lead.stage === 'COO Approval').length,
        };
      }),
    [visibleLeads, visibleSiteVisits],
  );

  return (
    <div className="space-y-6">
      <CommandCenterOverview user={user} leads={visibleLeads} siteVisits={visibleSiteVisits} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roleAwareKpis.map((kpi) => (
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

            <ChartCard title="Lead Stage Funnel" description="Business lifecycle movement from new lead to converted account.">
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
            <DataTable columns={recentLeadColumns} rows={recentVisibleLeads.length ? recentVisibleLeads : recentLeads} embedded />
          </ChartCard>

          {['Admin', 'BD Head'].includes(user?.role) ? (
            <ChartCard title="BD Team Overview" description="Executive-wise pipeline ownership and pending review visibility.">
              <DataTable columns={bdOverviewColumns} rows={bdTeamOverview} embedded />
            </ChartCard>
          ) : null}
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

function ApprovalDashboard({ title, description, stage, siteVisits, leads, user }) {
  const queue = siteVisits.filter((visit) => (visit.reviewStatus?.[stage] || ((visit.currentStage || visit.status) === stage ? 'Pending' : '')) === 'Pending');
  const pending = queue.filter((visit) => !['Approved', 'Rejected', 'Rework Requested'].includes(visit.approvalStatus)).length;
  const scope = reviewerScopeMatrix[stage] || reviewerScopeMatrix['Commercial Review'];
  const stageMatrix = Object.keys(workflowStageOwners).map((name) => {
    const visitsForStage = siteVisits.filter((visit) => visit.reviewStatus?.[name] || visit.currentStage === name);
    return {
      stage: name.replace(' Costing', '').replace(' Review', '').replace(' Validation', ''),
      Pending: visitsForStage.filter((visit) => (visit.reviewStatus?.[name] || (visit.currentStage === name ? 'Pending' : '')) === 'Pending').length,
      Approved: visitsForStage.filter((visit) => visit.reviewStatus?.[name] === 'Approved').length,
      Rework: visitsForStage.filter((visit) => visit.reviewStatus?.[name] === 'Rework Requested').length,
    };
  });
  const agingData = [
    { bucket: '0-2 days', records: Math.max(1, queue.length - 2) },
    { bucket: '3-5 days', records: queue.length ? 1 : 0 },
    { bucket: '6+ days', records: queue.length > 2 ? 1 : 0 },
  ];
  const scopeData = [
    { type: 'Editable', value: scope.editable },
    { type: 'View Only', value: scope.viewOnly },
    { type: 'Hidden', value: scope.hidden },
  ];
  const kpis = [
    { title: 'Pending Queue', value: pending, change: `Pending with ${workflowStageOwners[stage] || stage}`, icon: Clock3, tone: 'amber' },
    { title: 'Submitted Records', value: queue.length, change: 'Records in your review scope', icon: Layers3, tone: 'blue' },
    { title: 'Approved Stages', value: siteVisits.filter((visit) => visit.reviewStatus?.[stage] === 'Approved').length, change: 'Completed by this function', icon: CheckCircle2, tone: 'green' },
    { title: 'Rework / Risk', value: siteVisits.filter((visit) => ['Rework Requested', 'Rejected'].includes(visit.reviewStatus?.[stage])).length, change: 'Needs BD correction or closure', icon: AlertTriangle, tone: 'red' },
  ];

  return (
    <div className="space-y-6">
      <CommandCenterOverview user={user} leads={leads} siteVisits={siteVisits} stage={stage} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <ChartCard title={`${title} Scope Matrix`} description="Editable, view-only, and hidden sections for the current reviewer role.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={scopeData} dataKey="value" nameKey="type" innerRadius={62} outerRadius={92} paddingAngle={3}>
                  {scopeData.map((entry) => (
                    <Cell key={entry.type} fill={entry.type === 'Editable' ? '#10b981' : entry.type === 'View Only' ? '#2444a4' : '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Workflow Stage Matrix" description="Cross-stage approval health across the pre-operational workflow.">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageMatrix} margin={{ left: 4 }}>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Pending" stackId="stage" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Approved" stackId="stage" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Rework" stackId="stage" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ChartCard title="Review Aging" description="Queue aging overview for review SLA awareness.">
          <ChartFrame height="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="records" fill="#4f82fb" radius={[10, 10, 0, 0]} name="Records" />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ChartCard>

        <ChartCard title="Role Access Coverage" description="Scope areas visible to this function before AWS IAM separation.">
          <div className="space-y-3">
            {scope.rows.map((row) => (
              <div key={row.area} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.area}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{row.count} mapped fields / checkpoints</p>
                </div>
                <span className={[
                  'rounded-full px-3 py-1 text-xs font-bold',
                  row.access === 'Editable'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : row.access === 'Hidden'
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-qpms-50 text-qpms-700 dark:bg-qpms-500/15 dark:text-qpms-300',
                ].join(' ')}
                >
                  {row.access}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="enterprise-card p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Client', 'Submitted date', 'Stage', 'Pending with', 'Status', 'Remarks'].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-bold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {queue.length ? queue.map((visit) => (
                <tr key={visit.id}>
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">{visit.company}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{visit.lastApprovalAt ? new Date(visit.lastApprovalAt).toLocaleDateString() : 'Pending'}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{visit.currentStage}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{visit.pendingWith || stage}</td>
                  <td className="px-3 py-3"><StatusBadge status={visit.approvalStatus || 'Pending'} /></td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{visit.approvalRemarks || 'No shared remarks'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center text-sm font-semibold text-slate-500">No records are pending.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { leads, siteVisits } = useWorkflow();
  const [activeTab, setActiveTab] = useState('new-business');
  const [activeDashboardSection, setActiveDashboardSection] = useState(null);
  const [activeOperationsSection, setActiveOperationsSection] = useState(null);
  usePageTitle('Dashboard');
  const restrictedToPipeline = ['BD Head', 'BD Executive'].includes(user?.role);
  const reviewerDashboard = isOperationsTeam(user)
    ? {
        title: 'Operations Command Center',
        description: 'Operations review scope, execution readiness queue, SLA matrix, and existing business visibility.',
        queueTitle: 'Operations Review Queue',
        queueDescription: 'Records submitted for tools, equipment, consumables, machinery, and site readiness validation.',
        stage: 'Operations Review',
      }
    : isCoordinator(user)
      ? {
          title: 'Coordinator Command Center',
          description: 'Costing readiness, reliever logic, zone logic, manpower consolidation, and review workload visibility.',
          queueTitle: 'Coordinator Costing Queue',
          queueDescription: 'Records pending manpower consolidation, reliever logic, zone logic, and costing readiness.',
          stage: 'Coordinator Costing Review',
        }
      : isHrReviewer(user)
        ? {
            title: 'HR Command Center',
            description: 'HR manpower, wage, shift, gender, uniform, and validation workload dashboard.',
            queueTitle: 'HR Review Queue',
            queueDescription: 'Records submitted for manpower, wage, reliever, gender, shift, and uniform validation.',
            stage: 'HR Validation',
          }
        : isCommercialTeam(user)
          ? {
              title: 'Commercial Command Center',
              description: 'Commercial review queue, pricing scope, margin matrix, approval aging, and operations visibility.',
              queueTitle: 'Commercial Review Queue',
              queueDescription: 'Records submitted for commercial statement, pricing, management fee, and margin approval.',
              stage: 'Commercial Review',
            }
          : isFinanceTeam(user)
            ? {
                title: 'Finance Command Center',
                description: 'Finance review queue, payment terms, feasibility, risk, SLA aging, and operations visibility.',
                queueTitle: 'Finance Review Queue',
                queueDescription: 'Records approved by Commercial for billing, expense, margin, and payment validation.',
                stage: 'Finance Review',
              }
            : null;
  const canSeeOperations = ['Admin', 'COO'].includes(user?.role) || isCommercialTeam(user) || isFinanceTeam(user) || isOperationsTeam(user);
  const effectiveTab = canSeeOperations ? activeTab : 'new-business';

  const visibleLeads = useMemo(() => {
    if (canViewBdTeam(user) || user?.role === 'COO') return leads;
    return leads.filter((lead) => lead.assigned_bd_email === user?.email || lead.created_by_user_id === user?.id);
  }, [leads, user]);

  const visibleSiteVisits = useMemo(() => {
    if (canViewBdTeam(user) || user?.role === 'COO') return siteVisits;
    return siteVisits.filter((visit) => visit.assigned_bd_email === user?.email || visit.created_by_user_id === user?.id);
  }, [siteVisits, user]);

  return (
    <div className="space-y-7">
      <PageHeader
        title={reviewerDashboard?.title || 'Operations Command Center'}
        description={reviewerDashboard?.description || 'Management dashboard for new business pipeline health, site operations, attendance, tickets, tasks, field officers, and SLA visibility.'}
        actions={canSeeOperations ? <DashboardTabs tabs={reviewerDashboard ? reviewTabs : tabs} activeTab={activeTab} onChange={setActiveTab} /> : null}
      />

      {reviewerDashboard && effectiveTab === 'new-business' ? (
        <ApprovalDashboard
          title={reviewerDashboard.queueTitle}
          description={reviewerDashboard.queueDescription}
          stage={reviewerDashboard.stage}
          siteVisits={siteVisits}
          leads={leads}
          user={user}
        />
      ) : effectiveTab === 'new-business' || restrictedToPipeline ? (
        <NewBusinessPipeline
          activeDashboardSection={activeDashboardSection}
          onSectionChange={setActiveDashboardSection}
          visibleLeads={visibleLeads}
          visibleSiteVisits={visibleSiteVisits}
          user={user}
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
