import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileClock,
  FileText,
  Fingerprint,
  ListTodo,
  MapPin,
  Route,
  Send,
  ShieldCheck,
  TicketCheck,
  TimerReset,
  TrendingUp,
  UserCheck,
  UserRoundCheck,
  Users,
} from 'lucide-react';

export const workflowStages = [
  'Draft',
  'Submitted',
  'Commercial Review',
  'Finance Validation',
  'Approval Pending',
  'Approved',
  'Proposal Sent',
  'Converted',
  'Lost',
];

export const dashboardKpis = [
  { title: 'Open Leads', value: '42', change: '8 require assignment', icon: Building2, tone: 'blue' },
  { title: 'Pending Site Visits', value: '16', change: '5 scheduled today', icon: ClipboardCheck, tone: 'amber' },
  { title: 'Commercial Reviews', value: '11', change: '3 awaiting remarks', icon: FileCheck2, tone: 'violet' },
  { title: 'Converted Leads', value: '9', change: 'This month', icon: ShieldCheck, tone: 'green' },
  { title: 'Approval Pipeline', value: '23', change: 'Across hierarchy', icon: UserCheck, tone: 'blue' },
  { title: 'Proposal Status', value: '14', change: 'Sent or under revision', icon: FileText, tone: 'violet' },
  { title: 'Escalated Approvals', value: '4', change: 'Needs leadership action', icon: AlertTriangle, tone: 'amber' },
  { title: 'Pending Follow-ups', value: '27', change: 'Next 7 days', icon: Users, tone: 'green' },
];

export const leadRows = [
  {
    id: 1,
    company: 'Aster Medcity',
    contact: 'Rohit Nair',
    source: 'Referral',
    executive: 'Ananya Rao',
    stage: 'Site Visit',
    followUp: '15 May 2026',
    status: 'Active',
  },
  {
    id: 2,
    company: 'Emirates Facility Zone',
    contact: 'Meera Shah',
    source: 'Website',
    executive: 'Karthik Menon',
    stage: 'Commercial Review',
    followUp: '17 May 2026',
    status: 'Pending',
  },
  {
    id: 3,
    company: 'Metro Retail Parks',
    contact: 'Imran Khan',
    source: 'Outbound',
    executive: 'Nisha Iyer',
    stage: 'Finance Validation',
    followUp: '18 May 2026',
    status: 'Escalated',
  },
  {
    id: 4,
    company: 'BluePeak Business Tower',
    contact: 'Sanjay Paul',
    source: 'Partner',
    executive: 'Rahul Shah',
    stage: 'Proposal Sent',
    followUp: '20 May 2026',
    status: 'Active',
  },
  {
    id: 5,
    company: 'Greenline Hospital Group',
    contact: 'Priya Menon',
    source: 'Walk-in',
    executive: 'Ananya Rao',
    stage: 'Approval Pending',
    followUp: '21 May 2026',
    status: 'Pending',
  },
];

export const pipelineData = [
  { stage: 'Lead', count: 42 },
  { stage: 'Visit', count: 16 },
  { stage: 'MOM', count: 12 },
  { stage: 'Commercial', count: 11 },
  { stage: 'Finance', count: 8 },
  { stage: 'Approval', count: 23 },
  { stage: 'Proposal', count: 14 },
  { stage: 'Converted', count: 9 },
];

export const proposalData = [
  { name: 'Draft', value: 8 },
  { name: 'Under Review', value: 11 },
  { name: 'Sent', value: 14 },
  { name: 'Converted', value: 9 },
];

export const siteVisitDraft = {
  company: 'Aster Medcity',
  floors: '12',
  area: '2,45,000 sqft',
  housekeeping: '86 staff across three shifts',
  security: '42 guards with access control coverage',
  equipment: 'Ride-on scrubbers, wet/dry vacuums, trolleys',
  consumables: 'Monthly hygiene and cleaning consumable plan',
  notes: 'Include infection-control protocol, biomedical waste interface, and visitor-zone deep cleaning.',
};

export const commercialReviews = [
  {
    id: 1,
    account: 'Emirates Facility Zone',
    manpower: 'Reviewed',
    costing: 'Revision needed',
    remarks: 'Night shift security loading to be separated from housekeeping commercial.',
    status: 'Pending',
  },
  {
    id: 2,
    account: 'BluePeak Business Tower',
    manpower: 'Approved',
    costing: 'Approved',
    remarks: 'Proposal ready after branch head confirmation.',
    status: 'Approved',
  },
  {
    id: 3,
    account: 'Metro Retail Parks',
    manpower: 'Escalated',
    costing: 'Under finance validation',
    remarks: 'Consumable assumptions need client confirmation.',
    status: 'Escalated',
  },
];

export const approvalItems = [
  { id: 1, company: 'Aster Medcity', stage: 'Commercial Review', owner: 'Commercial Team', priority: 'High' },
  { id: 2, company: 'Metro Retail Parks', stage: 'Finance Validation', owner: 'Finance', priority: 'High' },
  { id: 3, company: 'Greenline Hospital Group', stage: 'Approval Pending', owner: 'COO', priority: 'Medium' },
  { id: 4, company: 'BluePeak Business Tower', stage: 'Proposal Sent', owner: 'Business Team', priority: 'Low' },
];

export const roleMatrix = [
  { id: 1, role: 'MD', access: 'Final approval, finance exceptions, strategic accounts', users: 1 },
  { id: 2, role: 'COO', access: 'Operational approval, branch escalations, proposal oversight', users: 2 },
  { id: 3, role: 'GM', access: 'Commercial review, region performance, workflow monitoring', users: 4 },
  { id: 4, role: 'Branch Head', access: 'Site validation, local approvals, team assignment', users: 8 },
  { id: 5, role: 'Business Team', access: 'Lead creation, follow-ups, site visit data capture', users: 18 },
  { id: 6, role: 'Operations', access: 'Requirement validation, manpower planning, MOM inputs', users: 24 },
  { id: 7, role: 'Supervisor', access: 'Site observations, photos, task feedback', users: 64 },
];

export const recentWorkflowActivity = [
  ['Site visit completed', 'Aster Medcity requirement form updated', 'Completed'],
  ['Commercial review requested', 'Emirates Facility Zone costing moved to commercial team', 'Pending'],
  ['Approval escalated', 'Metro Retail Parks pending finance validation', 'Escalated'],
  ['Proposal sent', 'BluePeak Business Tower quotation shared with client', 'Active'],
];

export const newBusinessKpis = [
  { title: 'Open Leads', value: '68', change: '14 new this week', icon: Building2, tone: 'blue' },
  { title: 'Site Visits Planned', value: '22', change: '7 scheduled today', icon: CalendarDays, tone: 'amber' },
  { title: 'Estimations Pending', value: '18', change: 'HK and security scope', icon: ClipboardList, tone: 'violet' },
  { title: 'Commercial Reviews', value: '13', change: '5 awaiting remarks', icon: FileCheck2, tone: 'amber' },
  { title: 'Approval Pending', value: '10', change: 'Hierarchy review queue', icon: UserCheck, tone: 'red' },
  { title: 'Proposals Sent', value: '26', change: '8 in client follow-up', icon: Send, tone: 'blue' },
  { title: 'Converted Leads', value: '11', change: 'This month', icon: TrendingUp, tone: 'green' },
];

export const leadSourceDistribution = [
  { name: 'LinkedIn', value: 16 },
  { name: 'Website', value: 21 },
  { name: 'Campaign', value: 12 },
  { name: 'Referral', value: 18 },
  { name: 'Direct Visit', value: 9 },
  { name: 'Email', value: 7 },
];

export const leadStageFunnel = [
  { stage: 'New', count: 68 },
  { stage: 'Contacted', count: 54 },
  { stage: 'Site Visit', count: 32 },
  { stage: 'Estimation', count: 24 },
  { stage: 'Commercial Review', count: 13 },
  { stage: 'Approval', count: 10 },
  { stage: 'Proposal', count: 26 },
  { stage: 'Converted', count: 11 },
];

export const monthlyLeadTrend = [
  { month: 'Jan', leads: 34, visits: 14 },
  { month: 'Feb', leads: 39, visits: 17 },
  { month: 'Mar', leads: 45, visits: 21 },
  { month: 'Apr', leads: 52, visits: 24 },
  { month: 'May', leads: 68, visits: 32 },
  { month: 'Jun', leads: 61, visits: 28 },
  { month: 'Jul', leads: 74, visits: 35 },
  { month: 'Aug', leads: 82, visits: 38 },
];

export const proposalConversionTrend = [
  { month: 'Jan', sent: 18, converted: 6 },
  { month: 'Feb', sent: 21, converted: 7 },
  { month: 'Mar', sent: 23, converted: 8 },
  { month: 'Apr', sent: 25, converted: 9 },
  { month: 'May', sent: 26, converted: 11 },
  { month: 'Jun', sent: 30, converted: 12 },
  { month: 'Jul', sent: 32, converted: 14 },
  { month: 'Aug', sent: 35, converted: 16 },
];

export const recentLeads = [
  { id: 1, company: 'Aster Medcity', source: 'Referral', assignedTo: 'Ananya Rao', stage: 'Site Visit', nextFollowUp: '15 May 2026', status: 'Active' },
  { id: 2, company: 'Emirates Facility Zone', source: 'Website', assignedTo: 'Karthik Menon', stage: 'Commercial Review', nextFollowUp: '17 May 2026', status: 'Pending' },
  { id: 3, company: 'Metro Retail Parks', source: 'LinkedIn', assignedTo: 'Nisha Iyer', stage: 'Approval', nextFollowUp: '18 May 2026', status: 'Escalated' },
  { id: 4, company: 'BluePeak Business Tower', source: 'Campaign', assignedTo: 'Rahul Shah', stage: 'Proposal', nextFollowUp: '20 May 2026', status: 'Active' },
  { id: 5, company: 'Greenline Hospital Group', source: 'Direct Visit', assignedTo: 'Ananya Rao', stage: 'Estimation', nextFollowUp: '21 May 2026', status: 'Pending' },
];

export const existingOperationsKpis = [
  { title: 'Active Sites', value: '512', change: 'Across 6 operating regions', icon: MapPin, tone: 'blue' },
  { title: 'Field Officers Active', value: '148', change: 'Live field coverage', icon: UserRoundCheck, tone: 'green' },
  { title: 'Attendance Captured Today', value: '92%', change: '42,860 punches synced', icon: Fingerprint, tone: 'green' },
  { title: 'Site Visits Completed', value: '286', change: 'Today across regions', icon: Route, tone: 'blue' },
  { title: 'Open Tickets', value: '74', change: '12 high priority', icon: TicketCheck, tone: 'amber' },
  { title: 'Pending Tasks', value: '319', change: 'Operational action queue', icon: ListTodo, tone: 'violet' },
  { title: 'Overdue Tasks', value: '31', change: 'Needs escalation', icon: FileClock, tone: 'red' },
  { title: 'Avg Resolution Time', value: '3h 18m', change: 'Across facility tickets', icon: TimerReset, tone: 'amber' },
];

export const stateOperationsSummary = [
  { id: 1, state: 'Tamil Nadu', activeSites: 138, officers: 38, attendance: 94, visits: 74, tickets: 18, tasks: 76, sla: 96, status: 'Healthy' },
  { id: 2, state: 'Kerala', activeSites: 82, officers: 24, attendance: 91, visits: 44, tickets: 11, tasks: 48, sla: 94, status: 'Healthy' },
  { id: 3, state: 'Karnataka', activeSites: 96, officers: 28, attendance: 89, visits: 52, tickets: 17, tasks: 61, sla: 91, status: 'Warning' },
  { id: 4, state: 'Telangana', activeSites: 74, officers: 19, attendance: 93, visits: 39, tickets: 9, tasks: 36, sla: 95, status: 'Healthy' },
  { id: 5, state: 'Andhra Pradesh - 1', activeSites: 67, officers: 21, attendance: 86, visits: 35, tickets: 13, tasks: 54, sla: 88, status: 'Warning' },
  { id: 6, state: 'Andhra Pradesh - 2', activeSites: 55, officers: 18, attendance: 82, visits: 42, tickets: 6, tasks: 44, sla: 84, status: 'Critical' },
];

export const siteVisitTrend = [
  { day: 'Mon', visits: 212, completed: 198 },
  { day: 'Tue', visits: 236, completed: 221 },
  { day: 'Wed', visits: 254, completed: 239 },
  { day: 'Thu', visits: 241, completed: 228 },
  { day: 'Fri', visits: 286, completed: 270 },
  { day: 'Sat', visits: 198, completed: 184 },
  { day: 'Sun', visits: 154, completed: 143 },
];

export const taskCompletionDistribution = [
  { name: 'Completed', value: 684 },
  { name: 'Pending', value: 319 },
  { name: 'Overdue', value: 31 },
];

export const fieldOfficerActivity = [
  { id: 1, name: 'Arun Prakash', state: 'Tamil Nadu', branch: 'Chennai', checkIn: '08:12 AM', lastActivity: 'HK audit uploaded', assignedSite: 'Aster Medcity', status: 'Active' },
  { id: 2, name: 'Meera Thomas', state: 'Kerala', branch: 'Kochi', checkIn: '08:28 AM', lastActivity: 'Ticket closed', assignedSite: 'Lulu Facility Block', status: 'Active' },
  { id: 3, name: 'Sandeep Rao', state: 'Karnataka', branch: 'Bengaluru', checkIn: '09:04 AM', lastActivity: 'Travelling to site', assignedSite: 'BluePeak Tower', status: 'In Transit' },
  { id: 4, name: 'Lakshmi Devi', state: 'Telangana', branch: 'Hyderabad', checkIn: '08:46 AM', lastActivity: 'Attendance variance review', assignedSite: 'Metro Retail Parks', status: 'Pending' },
  { id: 5, name: 'Naveen Kumar', state: 'Andhra Pradesh - 1', branch: 'Vijayawada', checkIn: '08:31 AM', lastActivity: 'Site checklist submitted', assignedSite: 'Greenline Hospital', status: 'Active' },
  { id: 6, name: 'Farhan Ali', state: 'Andhra Pradesh - 2', branch: 'Visakhapatnam', checkIn: '--', lastActivity: 'No activity for 2h', assignedSite: 'Port Admin Block', status: 'Offline' },
];
