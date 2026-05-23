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
  monthlyLeadTrend,
  operationsDetailSections,
  proposalConversionTrend,
  siteVisitTrend,
  stateOperationsSummary,
} from '../data/qpmsWorkflowData.js';
import { useAuth } from '../context/auth-context.js';
import { useWorkflow } from '../context/workflow-context.js';
import { bdExecutives, canViewBdTeam, isCommercialTeam, isCoordinator, isFinanceTeam, isHrReviewer, isOperationsTeam } from '../data/mockUsers.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { isDemoMode } from '../config/demoMode.js';

const tabs = [
  { id: 'new-business', label: 'New Business Pipeline' },
  { id: 'operations', label: 'Existing Business Operations' },
];

const reviewTabs = [
  { id: 'new-business', label: 'Review Dashboard' },
  { id: 'operations', label: 'Existing Business Operations' },
];

const taskColors = ['#10b981', '#f59e0b', '#ef4444'];
const chartGrid = '#e2e8f0';
const chartText = '#64748b';

const businessFilterOptions = ['All Businesses', 'Reliance Retail', 'Private Clients', 'DME', 'AP DSH', 'TN Government', 'Osmania Hospitals'];
const stateFilterOptions = ['All States', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana', 'Andhra Pradesh - 1', 'Andhra Pradesh - 2'];
const pipelineBusinessOptions = ['All Businesses', 'Retail', 'Healthcare', 'IT / Parks', 'Government', 'Private Clients'];
const pipelineRegionOptions = ['All Regions', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana', 'Andhra Pradesh'];
const dateRangeOptions = ['This Month', 'Last 30 Days', 'This Quarter', 'Year to Date'];

const businessStateCoverage = {
  'Reliance Retail': ['Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana'],
  'Private Clients': ['Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana', 'Andhra Pradesh - 1', 'Andhra Pradesh - 2'],
  DME: ['Andhra Pradesh - 1', 'Andhra Pradesh - 2', 'Telangana'],
  'AP DSH': ['Andhra Pradesh - 1', 'Andhra Pradesh - 2'],
  'TN Government': ['Tamil Nadu'],
  'Osmania Hospitals': ['Telangana'],
};

const businessWeights = {
  'Reliance Retail': 0.34,
  'Private Clients': 0.24,
  DME: 0.16,
  'AP DSH': 0.12,
  'TN Government': 0.08,
  'Osmania Hospitals': 0.06,
};

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

const businessSnapshotColumns = [
  { key: 'business', label: 'Business Name' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'escalations', label: 'Escalations' },
  { key: 'siteVisits', label: 'Site Visits' },
  { key: 'slaHealth', label: 'SLA Health' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const bdPerformanceColumns = [
  { key: 'executive', label: 'BD Executive' },
  { key: 'leads', label: 'Leads' },
  { key: 'conversion', label: 'Conversion %' },
  { key: 'pending', label: 'Pending' },
  { key: 'revenue', label: 'Revenue Generated' },
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

function ChartFrame({ children, height = 'h-56' }) {
  return <div className={`${height} min-w-0 overflow-hidden rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/55`}>{children}</div>;
}

function businessAppliesToState(business, state) {
  if (business === 'All Businesses') return true;
  return businessStateCoverage[business]?.includes(state);
}

function scaleOperationRow(row, business) {
  if (business === 'All Businesses') return row;
  const weight = businessWeights[business] || 0.18;
  const statePenalty = row.status === 'Critical' ? 1.12 : row.status === 'Warning' ? 1.06 : 1;
  const scaled = {
    ...row,
    activeSites: Math.max(3, Math.round(row.activeSites * weight)),
    officers: Math.max(1, Math.round(row.officers * weight)),
    visits: Math.max(1, Math.round(row.visits * weight)),
    tickets: Math.max(0, Math.round(row.tickets * weight * statePenalty)),
    tasks: Math.max(1, Math.round(row.tasks * weight * statePenalty)),
    sla: Math.max(72, Math.min(99, Math.round(row.sla - (1 - weight) * 4 + (business === 'Reliance Retail' ? 2 : 0)))),
  };
  return {
    ...scaled,
    attendance: Math.max(72, Math.min(99, Math.round(row.attendance - (1 - weight) * 3 + (business === 'TN Government' ? 2 : 0)))),
    status: scaled.sla < 86 || scaled.attendance < 84 || scaled.tickets > 8 ? 'Critical' : scaled.sla < 92 || scaled.attendance < 89 ? 'Warning' : 'Healthy',
  };
}

function filterOperationSummary(business, state) {
  return stateOperationsSummary
    .filter((row) => businessAppliesToState(business, row.state))
    .filter((row) => state === 'All States' || row.state === state)
    .map((row) => scaleOperationRow(row, business));
}

function sumOperationRows(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function averageOperationRows(rows, key) {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((total, row) => total + Number(row[key] || 0), 0) / rows.length);
}

function buildOperationsKpis(rows) {
  const activeSites = sumOperationRows(rows, 'activeSites');
  const officers = sumOperationRows(rows, 'officers');
  const attendance = averageOperationRows(rows, 'attendance');
  const visits = sumOperationRows(rows, 'visits');
  const tickets = sumOperationRows(rows, 'tickets');
  const tasks = sumOperationRows(rows, 'tasks');
  const criticalTickets = rows.filter((row) => row.status === 'Critical').reduce((total, row) => total + row.tickets, 0);
  const overdue = rows.filter((row) => row.status !== 'Healthy').reduce((total, row) => total + Math.max(1, Math.round(row.tasks * 0.1)), 0);
  const avgResolutionHours = Math.max(2.1, Math.min(5.8, 2.4 + tickets / Math.max(activeSites, 1) * 4 + overdue / 90));

  const valueById = {
    activeSites,
    fieldOfficersActive: officers,
    attendanceCaptured: `${attendance}%`,
    siteVisitsCompleted: visits,
    openTickets: tickets,
    pendingTasks: tasks,
    overdueTasks: overdue,
    avgResolutionTime: `${Math.floor(avgResolutionHours)}h ${Math.round((avgResolutionHours % 1) * 60)}m`,
  };
  const changeById = {
    activeSites: `Across ${rows.length || 0} filtered regions`,
    fieldOfficersActive: 'Filtered live field coverage',
    attendanceCaptured: `${Math.max(1200, activeSites * 84).toLocaleString('en-IN')} punches synced`,
    siteVisitsCompleted: 'Filtered operational visits',
    openTickets: `${criticalTickets || Math.max(1, Math.round(tickets * 0.16))} high priority`,
    pendingTasks: 'Filtered action queue',
    overdueTasks: 'Needs escalation',
    avgResolutionTime: 'Filtered facility tickets',
  };

  return existingOperationsKpis.map((kpi) => ({
    ...kpi,
    value: String(valueById[kpi.id] ?? kpi.value),
    change: changeById[kpi.id] || kpi.change,
  }));
}

function buildTaskDistribution(rows) {
  const pending = sumOperationRows(rows, 'tasks');
  const overdue = rows.filter((row) => row.status !== 'Healthy').reduce((total, row) => total + Math.max(1, Math.round(row.tasks * 0.1)), 0);
  return [
    { name: 'Completed', value: Math.max(20, Math.round(sumOperationRows(rows, 'visits') * 2.4)) },
    { name: 'Pending', value: pending },
    { name: 'Overdue', value: overdue },
  ];
}

function buildSeverityData(rows) {
  return [
    { severity: 'High', count: rows.filter((row) => row.status === 'Critical').reduce((total, row) => total + Math.max(1, Math.round(row.tasks * 0.08)), 0) },
    { severity: 'Medium', count: rows.filter((row) => row.status === 'Warning').reduce((total, row) => total + Math.max(1, Math.round(row.tasks * 0.12)), 0) },
    { severity: 'Low', count: rows.filter((row) => row.status === 'Healthy').reduce((total, row) => total + Math.max(1, Math.round(row.tasks * 0.04)), 0) },
  ];
}

function buildResolutionData(rows) {
  return rows.map((row) => ({
    state: row.state,
    hours: Number((2.2 + row.tickets / Math.max(row.activeSites, 1) * 7 + (100 - row.sla) / 18).toFixed(2)),
  }));
}

function buildBusinessSnapshot(business, state) {
  const businesses = business === 'All Businesses' ? businessFilterOptions.slice(1) : [business];
  return businesses.map((name) => {
    const rows = filterOperationSummary(name, state);
    const attendance = averageOperationRows(rows, 'attendance');
    const escalations = rows.reduce((total, row) => total + (row.status === 'Critical' ? row.tickets : Math.round(row.tickets * 0.25)), 0);
    const visits = sumOperationRows(rows, 'visits');
    const sla = averageOperationRows(rows, 'sla');
    return {
      id: name,
      business: name,
      attendance: `${attendance || 0}%`,
      escalations,
      siteVisits: visits,
      slaHealth: `${sla || 0}%`,
      status: sla < 88 || escalations > 8 ? 'Critical' : sla < 93 || attendance < 89 ? 'Warning' : 'Healthy',
    };
  });
}

function operationsStatus(rows) {
  if (!rows.length) return { label: 'Attention Required', tone: 'yellow' };
  const critical = rows.filter((row) => row.status === 'Critical').length;
  const warning = rows.filter((row) => row.status === 'Warning').length;
  if (critical) return { label: 'Critical Escalations', tone: 'red' };
  if (warning) return { label: 'Attention Required', tone: 'yellow' };
  return { label: 'Stable Operations', tone: 'green' };
}

function filterRowsByState(rows, summaryRows) {
  const allowedStates = new Set(summaryRows.map((row) => row.state));
  return rows.filter((row) => !row.state || allowedStates.has(row.state));
}

function buildFilteredOperationsDetailSections(summaryRows, business, state) {
  const suffix = `${business === 'All Businesses' ? 'All businesses' : business} / ${state === 'All States' ? 'All states' : state}`;
  return Object.fromEntries(Object.entries(operationsDetailSections).map(([key, detail]) => {
    const rows = key === 'attendanceCaptured'
      ? summaryRows.map((item) => ({
          id: item.id,
          state: item.state,
          attendance: `${item.attendance}%`,
          captured: item.activeSites * 84,
          missing: Math.max(4, 100 - item.attendance),
          exceptions: item.status === 'Healthy' ? 'Low' : 'Review needed',
          status: item.status,
        }))
      : filterRowsByState(detail.rows, summaryRows);

    return [key, { ...detail, description: `${detail.description} Filter: ${suffix}.`, rows }];
  }));
}

function pipelineBusinessForLead(lead) {
  const text = `${lead.company || ''} ${lead.industry || ''} ${lead.source || ''}`.toLowerCase();
  if (text.includes('retail') || text.includes('mall')) return 'Retail';
  if (text.includes('hospital') || text.includes('med') || text.includes('health')) return 'Healthcare';
  if (text.includes('tech') || text.includes('park') || text.includes('tower')) return 'IT / Parks';
  if (text.includes('government') || text.includes('admin') || text.includes('port')) return 'Government';
  return 'Private Clients';
}

function pipelineRegionForLead(lead) {
  const state = lead.state || lead.region || lead.city || '';
  if (state.includes('Andhra')) return 'Andhra Pradesh';
  return ['Tamil Nadu', 'Kerala', 'Karnataka', 'Telangana'].find((region) => state.includes(region)) || 'Tamil Nadu';
}

function filterPipelineLeads(leads, { business, region, owner }) {
  return leads.filter((lead) => {
    const businessMatch = business === 'All Businesses' || pipelineBusinessForLead(lead) === business;
    const regionMatch = region === 'All Regions' || pipelineRegionForLead(lead) === region;
    const ownerMatch = owner === 'All BD Owners' || lead.assigned_bd_executive === owner || lead.executive === owner;
    return businessMatch && regionMatch && ownerMatch;
  });
}

function stageCount(leads, siteVisits, matcher, fallback) {
  const count = matcher(leads, siteVisits);
  return leads.length || siteVisits.length ? count : fallback;
}

function buildPipelineCommandData(leads, siteVisits, bdRows) {
  const openLeads = leads.filter((lead) => !['Converted', 'Lost'].includes(lead.stage));
  const commercialPending = leads.filter((lead) => lead.stage === 'Commercial Review').length + siteVisits.filter((visit) => (visit.reviewStatus?.['Commercial Review'] || (visit.currentStage === 'Commercial Review' ? 'Pending' : '')) === 'Pending').length;
  const financePending = siteVisits.filter((visit) => (visit.reviewStatus?.['Finance Review'] || (visit.currentStage === 'Finance Review' ? 'Pending' : '')) === 'Pending').length;
  const hrPending = siteVisits.filter((visit) => (visit.reviewStatus?.['HR Validation'] || (visit.currentStage === 'HR Validation' ? 'Pending' : '')) === 'Pending').length;
  const approvalPending = commercialPending + financePending + hrPending + leads.filter((lead) => ['Approval Pending', 'BD Team Review', 'COO Approval'].includes(lead.stage)).length;
  const proposals = leads.filter((lead) => lead.stage === 'Proposal Sent').length + siteVisits.filter((visit) => ['Proposal Generated', 'Proposal Sent'].includes(visit.status) || visit.proposal).length;
  const converted = leads.filter((lead) => lead.stage === 'Converted' || lead.status === 'Converted to Assessment').length;
  const siteVisitCount = siteVisits.length || leads.filter((lead) => lead.stage === 'Site Visit Scheduled').length;
  const estimationCount = siteVisits.filter((visit) => ['Scheduled', 'Site Visit MOM Created', 'Site Visit MOM Sent', 'Pending Review'].includes(visit.status)).length;
  const totalLeadBase = Math.max(leads.length, 1);
  const proposalValue = Math.max(6800000, proposals * 2450000 + siteVisitCount * 850000);
  const projectedRevenue = Math.max(18470000, openLeads.length * 1850000 + converted * 4200000);

  const kpis = [
    { id: 'openLeads', title: 'Open Leads', value: stageCount(leads, siteVisits, () => openLeads.length, 18), tone: 'blue' },
    { id: 'siteVisitsPlanned', title: 'Site Visits', value: stageCount(leads, siteVisits, () => siteVisitCount, 8), tone: 'green' },
    { id: 'estimationsPending', title: 'Estimations Pending', value: stageCount(leads, siteVisits, () => estimationCount, 6), tone: 'violet' },
    { id: 'commercialReviews', title: 'Commercial Reviews', value: stageCount(leads, siteVisits, () => commercialPending, 4), tone: 'amber' },
    { id: 'approvalPending', title: 'Approvals Pending', value: stageCount(leads, siteVisits, () => approvalPending, 5), tone: 'red' },
    { id: 'proposalsSent', title: 'Proposals Sent', value: stageCount(leads, siteVisits, () => proposals, 5), tone: 'blue' },
    { id: 'convertedLeads', title: 'Converted Leads', value: stageCount(leads, siteVisits, () => converted, 2), tone: 'green' },
  ];

  const flow = [
    { stage: 'Lead', count: kpis[0].value, pending: Math.max(2, Math.round(kpis[0].value * 0.32)), conversion: 100, delayed: false },
    { stage: 'Contacted', count: stageCount(leads, siteVisits, (items) => items.filter((lead) => ['Contacted', 'In Discussion'].includes(lead.stage)).length, 12), pending: 4, conversion: 72, delayed: false },
    { stage: 'Site Visit', count: kpis[1].value, pending: 3, conversion: 54, delayed: false },
    { stage: 'Estimation', count: kpis[2].value, pending: kpis[2].value, conversion: 42, delayed: true },
    { stage: 'Commercial Review', count: kpis[3].value, pending: kpis[3].value, conversion: 34, delayed: true },
    { stage: 'Approval', count: kpis[4].value, pending: kpis[4].value, conversion: 28, delayed: true },
    { stage: 'Proposal', count: kpis[5].value, pending: 2, conversion: 22, delayed: false },
    { stage: 'Converted', count: kpis[6].value, pending: 0, conversion: Math.max(12, Math.round((converted / totalLeadBase) * 100)), delayed: false },
  ];

  const insights = [
    { label: 'Projected Revenue', value: formatInr(projectedRevenue), helper: 'Weighted active pipeline', tone: 'blue' },
    { label: 'Proposal Value', value: formatInr(proposalValue), helper: 'Sent + draft proposals', tone: 'green' },
    { label: 'Conversion %', value: `${Math.max(12, Math.round((converted / totalLeadBase) * 100))}%`, helper: 'Lead to converted', tone: 'amber' },
    { label: 'Avg Approval TAT', value: '18 hrs', helper: 'Commercial + finance', tone: 'green' },
    { label: 'Avg Lead Closure', value: '21 days', helper: 'From first contact', tone: 'violet' },
    { label: 'Proposal Success', value: '38%', helper: 'Rolling 90 days', tone: 'blue' },
  ];

  const bottlenecks = [
    { issue: 'Commercial Review delayed', delay: '2.8 days', affected: stageCount(leads, siteVisits, () => commercialPending, 4), priority: 'High' },
    { issue: 'Proposal approval pending', delay: '1.6 days', affected: stageCount(leads, siteVisits, () => approvalPending, 3), priority: 'High' },
    { issue: 'Site visit scheduling delay', delay: '1.2 days', affected: 2, priority: 'Medium' },
    { issue: 'Leads inactive > 3 days', delay: '3.4 days', affected: 4, priority: 'Medium' },
  ];

  const actions = [
    { label: 'Estimations pending', count: kpis[2].value, priority: 'High' },
    { label: 'Proposals awaiting approval', count: Math.max(3, approvalPending), priority: 'High' },
    { label: 'Site visits overdue', count: 2, priority: 'Medium' },
    { label: 'Leads inactive', count: 4, priority: 'Medium' },
  ];

  const activity = [
    { event: 'Lead moved to Site Visit', detail: leads[0]?.company || 'Metro Retail Parks', time: '10 mins ago' },
    { event: 'Proposal approved', detail: 'BluePeak Business Tower', time: '28 mins ago' },
    { event: 'Commercial review completed', detail: siteVisits[0]?.company || 'Aster Medcity', time: '45 mins ago' },
    { event: 'Proposal sent', detail: leads.find((lead) => lead.stage === 'Proposal Sent')?.company || 'Nova Tech Park', time: '1 hr ago' },
    { event: 'Lead converted', detail: leads.find((lead) => lead.stage === 'Converted')?.company || 'Green Square Mall', time: '3 hrs ago' },
  ];

  const performance = bdRows.map((row, index) => ({
    id: row.id,
    executive: row.executive,
    leads: row.totalLeads || [8, 6, 5][index] || 4,
    conversion: `${Math.max(14, Math.min(42, 18 + (row.siteVisitsScheduled || index + 1) * 4))}%`,
    pending: row.commercialPending + row.financePending + row.cooPending || index + 2,
    revenue: formatInr(Math.max(2400000, (row.siteVisitsScheduled || index + 2) * 1850000)),
  }));

  return { kpis, flow, insights, bottlenecks, actions, activity, performance };
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
  if (isDemoMode) return null;
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
    <section className="enterprise-card-compact p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold leading-5 text-slate-950 dark:text-white">Today's Operations</h2>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
          <div key={item.label} className="flex min-h-16 items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase leading-4 tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-0.5 text-lg font-semibold leading-none text-slate-950 dark:text-white">{item.value}</p>
              </div>
              <div className={`shrink-0 rounded-lg p-1.5 ring-1 ${compactTone(item.tone)}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActionCenter({ actions }) {
  return (
    <section className="enterprise-card-compact p-4">
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold leading-5 text-slate-950 dark:text-white">Pending Alerts</h2>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {actions.map((action) => (
          <div key={action.label} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold leading-5 text-slate-950 dark:text-white">{action.label}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${priorityClass(action.priority)}`}>{action.priority}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{action.count} records need attention</p>
            </div>
            <button type="button" className="focus-ring inline-flex items-center justify-center gap-1 rounded-lg bg-qpms-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-qpms-700">
              {action.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentActivityFeed({ items }) {
  return (
    <section className="enterprise-card-compact p-4">
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold leading-5 text-slate-950 dark:text-white">Recent Activity Feed</h2>
      </div>
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={`${item.event}-${item.time}`} className="flex gap-2.5">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-qpms-500 shadow-[0_0_0_3px_rgba(79,130,251,0.12)]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5 text-slate-950 dark:text-white">{item.event}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OperationalHealth({ items }) {
  return (
    <ChartCard title="Operational Health / SLA Insights">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl p-3 ring-1 ${healthTone[item.tone]}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase leading-4 tracking-wide">{item.label}</p>
                <p className="mt-1 text-xl font-semibold leading-none">{item.value}</p>
                <p className="mt-1 text-[11px] font-semibold opacity-80">{item.helper}</p>
              </div>
              <TimerReset className="h-4 w-4 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function DemoStatusPanel({ leads, siteVisits, backendStatus, workflowError, workflowDebug }) {
  const pendingByStage = (stage) => siteVisits.filter((visit) => (visit.reviewStatus?.[stage] || (visit.currentStage === stage ? 'Pending' : '')) === 'Pending').length;
  const generatedProposals = siteVisits.filter((visit) => visit.proposal || ['Proposal Generated', 'Proposal Sent'].includes(visit.status)).length;
  const approvedProposals = siteVisits.filter((visit) => {
    const statuses = Object.values(visit.reviewStatus || {});
    const allApprovalsApproved = statuses.length && statuses.every((status) => status === 'Approved');
    return ['Proposal Sent', 'Ready for Proposal', 'Proposal Generated'].includes(visit.status) || visit.approvalStatus === 'Approved' || allApprovalsApproved;
  }).length;
  const isLoading = backendStatus === 'connecting' || backendStatus === 'saving';
  const isError = backendStatus === 'error';
  const latestLead = leads[0] || {};
  const items = [
    { label: 'Total leads', value: leads.length, tone: 'blue' },
    { label: 'Pending Commercial', value: pendingByStage('Commercial Review'), tone: 'amber' },
    { label: 'Pending Finance', value: pendingByStage('Finance Review'), tone: 'violet' },
    { label: 'Pending HR', value: pendingByStage('HR Validation'), tone: 'green' },
    { label: 'Approved proposals', value: approvedProposals, tone: 'green' },
    { label: 'Generated proposals', value: generatedProposals, tone: 'blue' },
  ];

  return (
    <section className="enterprise-card-compact overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold text-slate-950 dark:text-white">Demo Workflow Status</h2>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${isError ? compactTone('red') : isLoading ? compactTone('amber') : compactTone('green')}`}>
              {isError ? 'Data issue' : isLoading ? 'Loading' : 'Ready'}
            </span>
            {isDemoMode ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${compactTone('blue')}`}>DEMO MODE</span> : null}
          </div>
        </div>
        {workflowError ? <p className="max-w-xl text-xs font-semibold text-rose-600 dark:text-rose-300">{workflowError}</p> : null}
      </div>
      {isError ? (
        <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
          Unable to load workflow data. Check Supabase environment and API health before the demo.
        </div>
      ) : null}
      {!isLoading && !isError && !leads.length && !siteVisits.length ? (
        <div className="m-4 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          No demo records yet. Run the Postman approval flow or create a lead from Lead Management to populate this status board.
        </div>
      ) : null}
      <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="truncate text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold leading-none text-slate-950 dark:text-white">{isLoading ? '...' : item.value}</p>
          </div>
        ))}
      </div>
      <ExecutiveWorkflowStepper leads={leads} siteVisits={siteVisits} />
      <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
            <span className="block text-[10px] font-bold uppercase text-slate-400">DEMO DEBUG: leads fetched</span>
            {workflowDebug?.totalLeadsFetched ?? leads.length}
          </div>
          <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Latest lead id</span>
            {workflowDebug?.latestLeadId || latestLead.id || '-'}
          </div>
          <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Latest client</span>
            {workflowDebug?.latestClientName || latestLead.company || '-'}
          </div>
          <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
            <span className="block text-[10px] font-bold uppercase text-slate-400">API source</span>
            {workflowDebug?.apiSource || (backendStatus === 'connected' ? 'supabase.public.leads' : 'local')}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExecutiveWorkflowStepper({ leads, siteVisits }) {
  const countStage = (name) => siteVisits.filter((visit) => visit.currentStage === name || visit.reviewStatus?.[name]).length;
  const stages = [
    { label: 'Lead', count: leads.length },
    { label: 'Site Visit', count: siteVisits.length },
    { label: 'Assessment', count: siteVisits.filter((visit) => visit.assessmentStatus || visit.survey).length },
    { label: 'Commercial', count: countStage('Commercial Review') },
    { label: 'Finance', count: countStage('Finance Review') },
    { label: 'HR', count: countStage('HR Validation') },
    { label: 'Approved', count: siteVisits.filter((visit) => visit.approvalStatus === 'Approved' || Object.values(visit.reviewStatus || {}).includes('Approved')).length },
    { label: 'Proposal', count: siteVisits.filter((visit) => visit.proposal || ['Proposal Generated', 'Proposal Sent'].includes(visit.status)).length },
  ];

  return (
    <div className="border-t border-slate-100 px-3 py-3 dark:border-slate-800">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Workflow Status</p>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[860px] items-stretch gap-2">
          {stages.map((stage, index) => (
            <div key={stage.label} className="relative flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              {index < stages.length - 1 ? <div className="absolute -right-2 top-1/2 h-0.5 w-2 bg-slate-200 dark:bg-slate-800" /> : null}
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{stage.label}</p>
                <CheckCircle2 className={`h-3.5 w-3.5 ${stage.count ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
              </div>
              <p className="mt-1 text-xl font-semibold leading-none text-slate-950 dark:text-white">{stage.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommandCenterOverview({ user, leads, siteVisits, stage }) {
  const data = useMemo(() => buildCommandCenterData({ user, leads, siteVisits, stage }), [user, leads, siteVisits, stage]);
  const isExecutiveView = ['Admin', 'COO'].includes(user?.role);

  return (
    <div className="space-y-4">
      {isExecutiveView ? null : <QuickActionBar user={user} />}
      <TodayOperations items={data.todayOperations} />
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ActionCenter actions={data.actions} />
        <RecentActivityFeed items={data.recentActivity} />
      </section>
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

function OperationsDrilldownChart({ sectionId, summaryRows = stateOperationsSummary }) {
  const taskDistribution = buildTaskDistribution(summaryRows);
  const severityData = buildSeverityData(summaryRows);
  const resolutionData = buildResolutionData(summaryRows);
  const chartBySection = {
    activeSites: (
      <BarChart data={summaryRows}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="activeSites" fill="#2444a4" radius={[10, 10, 0, 0]} name="Active Sites" />
      </BarChart>
    ),
    fieldOfficersActive: (
      <BarChart data={summaryRows}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="officers" fill="#10b981" radius={[10, 10, 0, 0]} name="Field Officers" />
      </BarChart>
    ),
    attendanceCaptured: (
      <ComposedChart data={summaryRows}>
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
      <BarChart data={summaryRows}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="tickets" fill="#f59e0b" radius={[10, 10, 0, 0]} name="Open Tickets" />
      </BarChart>
    ),
    pendingTasks: (
      <PieChart>
        <Pie data={taskDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
          {taskDistribution.map((entry, index) => (
            <Cell key={entry.name} fill={taskColors[index]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    ),
    overdueTasks: (
      <BarChart data={severityData}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="severity" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill="#ef4444" radius={[10, 10, 0, 0]} name="Overdue Tasks" />
      </BarChart>
    ),
    avgResolutionTime: (
      <BarChart data={resolutionData}>
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

function PipelineFilterBar({ filters, onChange, ownerOptions }) {
  const fields = [
    ['Business Filter', 'business', pipelineBusinessOptions],
    ['Region Filter', 'region', pipelineRegionOptions],
    ['BD Owner Filter', 'owner', ownerOptions],
    ['Date Range Filter', 'dateRange', dateRangeOptions],
  ];

  return (
    <section className="enterprise-card-compact p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {fields.map(([label, key, options]) => (
          <label key={key} className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
            <select
              value={filters[key]}
              onChange={(event) => onChange(key, event.target.value)}
              className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              {options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

function PipelineKpiStrip({ items }) {
  return (
    <section className="enterprise-card-compact p-3 sm:p-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/55">
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.title}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xl font-semibold leading-none text-slate-950 dark:text-white">{item.value}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${item.tone === 'red' ? 'bg-rose-500' : item.tone === 'amber' ? 'bg-amber-500' : item.tone === 'green' ? 'bg-emerald-500' : item.tone === 'violet' ? 'bg-violet-500' : 'bg-qpms-500'}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PipelineFlow({ stages }) {
  return (
    <section className="enterprise-card-compact p-4">
      <div className="mb-3">
        <h2 className="text-[16px] font-semibold text-slate-950 dark:text-white">Pipeline Stage Flow</h2>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-[980px] items-stretch gap-2">
          {stages.map((stage, index) => (
          <div key={stage.stage} className="relative flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
              {index < stages.length - 1 ? <div className="absolute -right-2 top-1/2 h-0.5 w-2 bg-slate-200 dark:bg-slate-800" /> : null}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{stage.stage}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stage.delayed ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'}`}>
                  {stage.delayed ? 'Delay' : 'OK'}
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold leading-none text-slate-950 dark:text-white">{stage.count}</p>
              <div className="mt-3 space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between"><span>Pending</span><span>{stage.pending}</span></div>
                <div className="flex justify-between"><span>Conversion</span><span>{stage.conversion}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineInsightGrid({ items }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="enterprise-card-compact p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="mt-1 text-xl font-semibold leading-none text-slate-950 dark:text-white">{item.value}</p>
          <p className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.helper}</p>
        </div>
      ))}
    </section>
  );
}

function PipelineBottlenecks({ items }) {
  return (
    <section className="enterprise-card-compact p-4">
      <div className="mb-3">
        <h2 className="text-[16px] font-semibold text-slate-950 dark:text-white">Pipeline Bottlenecks</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.issue} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/55">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold leading-5 text-slate-950 dark:text-white">{item.issue}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${priorityClass(item.priority)}`}>{item.priority}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{item.delay} avg delay</span>
              <span>{item.affected} affected</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PipelineActionActivity({ actions, activity }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="enterprise-card-compact p-4">
        <div className="mb-3">
          <h2 className="text-[16px] font-semibold text-slate-950 dark:text-white">Pending Actions</h2>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {actions.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/55">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.count} {item.label}</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Needs owner follow-up</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${priorityClass(item.priority)}`}>{item.priority}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="enterprise-card-compact p-4">
        <div className="mb-3">
          <h2 className="text-[16px] font-semibold text-slate-950 dark:text-white">Recent Pipeline Activity</h2>
        </div>
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {activity.map((item) => (
            <div key={`${item.event}-${item.time}`} className="flex gap-2.5 border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-qpms-500 shadow-[0_0_0_3px_rgba(79,130,251,0.12)]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-slate-950 dark:text-white">{item.event}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewBusinessPipeline({ visibleLeads, visibleSiteVisits, user }) {
  const [filters, setFilters] = useState({
    business: 'All Businesses',
    region: 'All Regions',
    owner: 'All BD Owners',
    dateRange: 'This Month',
  });
  const ownerOptions = useMemo(
    () => ['All BD Owners', ...bdExecutives.map((executive) => executive.name)],
    [],
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
  const filteredLeads = useMemo(() => filterPipelineLeads(visibleLeads, filters), [visibleLeads, filters]);
  const filteredSiteVisits = useMemo(
    () => visibleSiteVisits.filter((visit) => {
      const ownerMatch = filters.owner === 'All BD Owners' || visit.assigned_bd_executive === filters.owner;
      const regionMatch = filters.region === 'All Regions' || (visit.state || visit.city || '').includes(filters.region);
      const businessMatch = filters.business === 'All Businesses' || pipelineBusinessForLead(visit) === filters.business;
      return ownerMatch && regionMatch && businessMatch;
    }),
    [visibleSiteVisits, filters],
  );
  const pipelineData = useMemo(
    () => buildPipelineCommandData(filteredLeads, filteredSiteVisits, bdTeamOverview),
    [filteredLeads, filteredSiteVisits, bdTeamOverview],
  );

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <PipelineFilterBar filters={filters} onChange={updateFilter} ownerOptions={ownerOptions} />
      <PipelineKpiStrip items={pipelineData.kpis} />
      <PipelineFlow stages={pipelineData.flow} />

      <section className="space-y-3">
        <div>
          <h2 className="text-[17px] font-semibold text-slate-950 dark:text-white">Revenue & Conversion Insights</h2>
        </div>
        <PipelineInsightGrid items={pipelineData.insights} />
        <section className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Monthly Pipeline Trend">
            <ChartFrame height="h-48">
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

          <ChartCard title="Proposal Conversion Trend">
            <ChartFrame height="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={proposalConversionTrend}>
                  <defs>
                    <linearGradient id="pipelineProposalSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f82fb" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#4f82fb" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="pipelineProposalConverted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.42} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="sent" stroke="#4f82fb" strokeWidth={2.5} fill="url(#pipelineProposalSent)" name="Proposals Sent" />
                  <Area type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2.5} fill="url(#pipelineProposalConverted)" name="Converted" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartFrame>
          </ChartCard>
        </section>
      </section>

      <PipelineBottlenecks items={pipelineData.bottlenecks} />
      <PipelineActionActivity actions={pipelineData.actions} activity={pipelineData.activity} />

      {['Admin', 'BD Head'].includes(user?.role) ? (
        <ChartCard title="BD Team Performance">
          <DataTable columns={bdPerformanceColumns} rows={pipelineData.performance} embedded />
        </ChartCard>
      ) : null}
    </div>
  );
}

function ExistingBusinessOperations({ activeOperationsSection, onSectionChange }) {
  const [businessFilter, setBusinessFilter] = useState('All Businesses');
  const [stateFilter, setStateFilter] = useState('All States');
  const filteredSummary = useMemo(() => filterOperationSummary(businessFilter, stateFilter), [businessFilter, stateFilter]);
  const operationKpis = useMemo(() => buildOperationsKpis(filteredSummary), [filteredSummary]);
  const operationSections = useMemo(
    () => buildFilteredOperationsDetailSections(filteredSummary, businessFilter, stateFilter),
    [filteredSummary, businessFilter, stateFilter],
  );
  const snapshotRows = useMemo(() => buildBusinessSnapshot(businessFilter, stateFilter), [businessFilter, stateFilter]);
  const status = operationsStatus(filteredSummary);
  const filteredOfficers = useMemo(
    () => filterRowsByState(fieldOfficerActivity, filteredSummary),
    [filteredSummary],
  );
  const filteredTaskDistribution = useMemo(() => buildTaskDistribution(filteredSummary), [filteredSummary]);

  return (
    <div className="space-y-6">
      <section className="enterprise-card p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Existing Business Operations</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(180px,220px)_minmax(180px,220px)_auto] sm:items-end">
            <label className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Business Filter</span>
              <select
                value={businessFilter}
                onChange={(event) => {
                  setBusinessFilter(event.target.value);
                  onSectionChange(null);
                }}
                className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {businessFilterOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">State Filter</span>
              <select
                value={stateFilter}
                onChange={(event) => {
                  setStateFilter(event.target.value);
                  onSectionChange(null);
                }}
                className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {stateFilterOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <span className={`inline-flex h-10 items-center justify-center rounded-xl px-3 text-xs font-bold ring-1 ${healthTone[status.tone]}`}>
              {status.label}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {operationKpis.map((kpi) => (
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
          sections={operationSections}
          renderChart={(sectionId) => <OperationsDrilldownChart sectionId={sectionId} summaryRows={filteredSummary} />}
        />
      ) : (
        <div className="space-y-6 animate-[login-fade-up_220ms_ease-out]">
          <ChartCard title="Business Performance Snapshot">
            <DataTable columns={businessSnapshotColumns} rows={snapshotRows} embedded />
          </ChartCard>

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="State-wise Site Performance">
              <ChartFrame>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSummary}>
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

            <ChartCard title="Attendance by State">
              <ChartFrame>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredSummary}>
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
            <ChartCard title="Ticket Volume by State">
              <ChartFrame>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSummary}>
                    <CartesianGrid stroke={chartGrid} vertical={false} />
                    <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 11 }} interval={0} height={62} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: chartText, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="tickets" fill="#f59e0b" radius={[10, 10, 0, 0]} name="Open Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartFrame>
            </ChartCard>

            <ChartCard title="Task Completion Distribution">
              <ChartFrame>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={filteredTaskDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                      {filteredTaskDistribution.map((entry, index) => (
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
            <ChartCard title="Site Visit Trend">
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

            <ChartCard title="SLA Performance by State">
              <ChartFrame>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={filteredSummary}>
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

          <ChartCard title="State-wise Operations Summary">
            <DataTable columns={operationsColumns} rows={filteredSummary} embedded />
          </ChartCard>

          <ChartCard title="Field Officer Activity">
            <DataTable columns={officerColumns} rows={filteredOfficers} embedded />
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
        <ChartCard title={`${title} Scope Matrix`}>
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

        <ChartCard title="Workflow Stage Matrix">
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
        <ChartCard title="Review Aging">
          <ChartFrame height="h-48">
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

        <ChartCard title="Role Access Coverage">
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
  const { leads, siteVisits, backendStatus, workflowError, workflowDebug } = useWorkflow();
  const [activeTab, setActiveTab] = useState('new-business');
  const [activeOperationsSection, setActiveOperationsSection] = useState(null);
  usePageTitle('Dashboard');
  const restrictedToPipeline = ['BD Head', 'BD Executive'].includes(user?.role);
  const reviewerDashboard = isOperationsTeam(user)
    ? {
        title: 'Operations Review',
            description: '',
        queueTitle: 'Operations Review Queue',
        queueDescription: 'Review queue.',
        stage: 'Operations Review',
      }
    : isCoordinator(user)
      ? {
          title: 'Coordinator Review',
          description: '',
          queueTitle: 'Coordinator Costing Queue',
          queueDescription: 'Review queue.',
          stage: 'Coordinator Costing Review',
        }
      : isHrReviewer(user)
        ? {
            title: 'HR Review',
            description: '',
            queueTitle: 'HR Review Queue',
            queueDescription: 'Review queue.',
            stage: 'HR Validation',
          }
        : isCommercialTeam(user)
          ? {
              title: 'Commercial Review',
              description: '',
              queueTitle: 'Commercial Review Queue',
              queueDescription: 'Review queue.',
              stage: 'Commercial Review',
            }
          : isFinanceTeam(user)
            ? {
                title: 'Finance Review',
                description: '',
                queueTitle: 'Finance Review Queue',
                queueDescription: 'Review queue.',
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
        title={reviewerDashboard?.title || 'Dashboard'}
        description={reviewerDashboard?.description}
        actions={canSeeOperations ? <DashboardTabs tabs={reviewerDashboard ? reviewTabs : tabs} activeTab={activeTab} onChange={setActiveTab} /> : null}
      />

      <DemoStatusPanel
        leads={visibleLeads}
        siteVisits={visibleSiteVisits}
        backendStatus={backendStatus}
        workflowError={workflowError}
        workflowDebug={workflowDebug}
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
