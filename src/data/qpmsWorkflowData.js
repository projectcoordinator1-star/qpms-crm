import {
  AlertTriangle,
  Building2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  ShieldCheck,
  UserCheck,
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
