import cors from 'cors';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';

dotenv.config({ path: './backend/.env' });

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

const apiDemoUsers = [
  { id: 'bd-1', name: 'Ananya Rao', email: 'bd1@qpms.co.in', password: '123456', role: 'BD Executive' },
  { id: 'commercial-1', name: 'Commercial Team 1', email: 'commercial1@qpms.co.in', password: '123456', role: 'Commercial Reviewer' },
  { id: 'finance-1', name: 'Finance Team 1', email: 'finance1@qpms.co.in', password: '123456', role: 'Finance Reviewer' },
  { id: 'hr-1', name: 'HR Reviewer 1', email: 'hr1@qpms.co.in', password: '123456', role: 'HR Reviewer' },
  { id: 'admin', name: 'Admin', email: 'admin@qpms.co.in', password: '123456', role: 'Admin' },
];

const approvalMatrixStore = {
  tokens: new Map(),
  leads: new Map(),
  siteVisits: new Map(),
  approvals: new Map(),
  events: [],
};

const approvalRoleMap = {
  Commercial: 'Commercial Reviewer',
  Finance: 'Finance Reviewer',
  HR: 'HR Reviewer',
  Management: 'Admin',
};

const reviewerRoleToDepartment = {
  'Commercial Reviewer': 'Commercial',
  'Finance Reviewer': 'Finance',
  'HR Reviewer': 'HR',
  Admin: 'Management',
};

function normalizeDecision(value) {
  const decision = String(value || '').trim().toLowerCase();
  if (['approve', 'approved'].includes(decision)) return 'Approved';
  if (['reject', 'rejected'].includes(decision)) return 'Rejected';
  if (['rework', 'request rework', 'rework requested'].includes(decision)) return 'Rework Requested';
  return '';
}

function createApiId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

function createToken(user) {
  const token = `qpms-demo-${user.id}-${randomUUID()}`;
  approvalMatrixStore.tokens.set(token, user);
  return token;
}

function getBearerToken(request) {
  return String(request.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
}

function requireApiAuth(request, response, next) {
  const token = getBearerToken(request);
  const user = approvalMatrixStore.tokens.get(token);
  if (!user) {
    response.status(401).json({ ok: false, message: 'Valid Bearer token required. Login with /api/auth/login first.' });
    return;
  }
  request.apiUser = user;
  next();
}

function requireRoles(roles) {
  return (request, response, next) => {
    if (!roles.includes(request.apiUser?.role)) {
      response.status(403).json({ ok: false, message: `Role ${request.apiUser?.role || 'Unknown'} cannot perform this action.` });
      return;
    }
    next();
  };
}

function addApprovalEvent(type, payload) {
  approvalMatrixStore.events.push({
    id: createApiId('evt'),
    type,
    at: new Date().toISOString(),
    ...payload,
  });
}

function getSiteVisitApprovals(siteVisitId) {
  return [...approvalMatrixStore.approvals.values()].filter((approval) => approval.siteVisitId === siteVisitId);
}

function calculateWorkflowStatus(siteVisitId) {
  const approvals = getSiteVisitApprovals(siteVisitId);
  const rejected = approvals.find((approval) => approval.status === 'Rejected');
  if (rejected) {
    return {
      approvalStatus: 'Rejected',
      currentStage: `${rejected.stage} Rejected`,
      pendingWith: 'BD Executive',
      reworkStatus: 'Closed',
    };
  }

  const rework = approvals.find((approval) => approval.status === 'Rework Requested');
  if (rework) {
    return {
      approvalStatus: 'Rework Requested',
      currentStage: `${rework.stage} Rework`,
      pendingWith: 'BD Executive',
      reworkStatus: 'Open',
    };
  }

  const pending = approvals.filter((approval) => approval.status === 'Pending');
  if (pending.length) {
    return {
      approvalStatus: 'Pending',
      currentStage: 'Approval Matrix Review',
      pendingWith: pending.map((approval) => approval.department).join(', '),
      reworkStatus: 'None',
    };
  }

  return {
    approvalStatus: approvals.length ? 'Approved' : 'Not Submitted',
    currentStage: approvals.length ? 'Returned to BD' : 'Site Visit Started',
    pendingWith: approvals.length ? 'BD Executive' : 'BD Executive',
    reworkStatus: 'None',
  };
}

function syncSiteVisitWorkflow(siteVisitId) {
  const visit = approvalMatrixStore.siteVisits.get(siteVisitId);
  if (!visit) return null;
  const workflow = calculateWorkflowStatus(siteVisitId);
  const nextVisit = {
    ...visit,
    ...workflow,
    status: workflow.approvalStatus === 'Approved' ? 'Ready for Proposal' : workflow.approvalStatus,
    updatedAt: new Date().toISOString(),
  };
  approvalMatrixStore.siteVisits.set(siteVisitId, nextVisit);
  return nextVisit;
}

function createApproval(siteVisit, department, stage) {
  const approval = {
    id: createApiId('apr'),
    approvalId: '',
    leadId: siteVisit.leadId,
    siteVisitId: siteVisit.id,
    department,
    stage,
    assignedRole: approvalRoleMap[department],
    status: 'Pending',
    remarks: '',
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  approval.approvalId = approval.id;
  approvalMatrixStore.approvals.set(approval.id, approval);
  return approval;
}

function ensureApprovalMatrix(siteVisit) {
  const existing = getSiteVisitApprovals(siteVisit.id);
  if (existing.length) return existing;

  const approvals = [
    createApproval(siteVisit, 'Commercial', 'Commercial Review'),
    createApproval(siteVisit, 'Finance', 'Finance Review'),
    createApproval(siteVisit, 'HR', 'HR Review'),
  ];

  if (Number(siteVisit.assessment?.proposalValue || 0) >= 2500000) {
    approvals.push(createApproval(siteVisit, 'Management', 'COO Approval'));
  }

  return approvals;
}

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS are required');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });
}

async function verifyMailTransporter() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('[QPMS Mail API] SMTP transporter verified', {
      host: 'smtp.gmail.com',
      port: 587,
      family: 4,
      emailUserConfigured: Boolean(process.env.EMAIL_USER),
    });
  } catch (error) {
    console.error('[QPMS Mail API] SMTP transporter verification failed', {
      message: error.message,
      code: error.code,
      command: error.command,
    });
  }
}

function normalizeRecipients(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeServiceScope(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, item]) => item === true || item?.selected)
      .map(([key]) => key);
  }
  return String(value || '')
    .split(/,|\n/)
    .map((item) => item.trim().replace(/^-+\s*/, ''))
    .filter(Boolean);
}

function hasSiteVisitSchedule(payload) {
  return Boolean(
    (payload.scheduledVisitDate || payload.scheduled_site_visit_date) &&
      (payload.scheduledVisitTime || payload.scheduled_site_visit_time),
  );
}

function hasFollowUp(payload) {
  return Boolean(payload.nextFollowUpDate || payload.next_followup_date);
}

function formatIcsDate(date, time) {
  const source = new Date(`${date}T${time}`);
  if (Number.isNaN(source.getTime())) return '';
  return source.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value) {
  return String(value || '')
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldIcsLine(line) {
  const chunks = [];
  let remaining = line;
  while (remaining.length > 74) {
    chunks.push(remaining.slice(0, 74));
    remaining = ` ${remaining.slice(74)}`;
  }
  chunks.push(remaining);
  return chunks.join('\r\n');
}

function buildLeadSiteVisitInvite(payload) {
  const date = payload.scheduledVisitDate || payload.scheduled_site_visit_date;
  const time = payload.scheduledVisitTime || payload.scheduled_site_visit_time;
  const start = formatIcsDate(date, time);
  if (!start) return null;

  const endDate = new Date(`${date}T${time}`);
  endDate.setHours(endDate.getHours() + 1);
  const end = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const clientName = payload.clientName || payload.client_name || payload.company || 'Client';
  const attendees = [
    ...(payload.primaryContactEmail ? [payload.primaryContactEmail] : []),
    ...normalizeRecipients(payload.to || payload.toEmail || payload.to_email),
    payload.assignedBdEmail || payload.assigned_bd_email,
    ...normalizeRecipients(payload.cc || payload.ccEmails || payload.cc_emails),
  ].filter(Boolean);
  const uniqueAttendees = [...new Set(attendees.map((email) => email.trim()).filter((email) => email.includes('@')))];
  const uid = `qpms-site-visit-${Date.now()}@qpms-crm`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QPMS//CRM Workflow//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(`QPMS Site Visit - ${clientName}`)}`,
    'DESCRIPTION:Site visit scheduled from QPMS CRM.',
    `LOCATION:${escapeIcsText(payload.location || payload.siteLocation || payload.site_location || 'Lead site location')}`,
    `ORGANIZER;CN=QPMS CRM:MAILTO:${process.env.EMAIL_USER}`,
    ...uniqueAttendees.map((email) => `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${email}`),
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(foldIcsLine).join('\r\n');
}

async function sendMomEmail(payload, type) {
  const transporter = createTransporter();
  const to = normalizeRecipients(payload.to || payload.toEmail || payload.to_email);
  const cc = normalizeRecipients(payload.cc || payload.ccEmails || payload.cc_emails);

  if (!to.length) {
    const error = new Error('At least one recipient is required');
    error.statusCode = 400;
    throw error;
  }

  if (type === 'lead' && !hasSiteVisitSchedule(payload) && !hasFollowUp(payload)) {
    const error = new Error('Please provide either Site Visit Schedule Date & Time or Next Follow-up Date before sending the Minutes of Meeting.');
    error.statusCode = 400;
    throw error;
  }

  const subject = payload.subject || (type === 'lead' ? `Lead Minutes of Meeting - ${payload.clientName || payload.client_name || payload.company || 'Client'} - QPMS` : 'QPMS Site Visit MOM');
  const html = payload.html || buildDefaultHtml(payload, type);
  const calendarInvite = type === 'lead' && hasSiteVisitSchedule(payload) ? buildLeadSiteVisitInvite(payload) : null;
  const attachments = [
    ...(payload.attachments || []),
    ...(calendarInvite
      ? [
          {
            filename: 'qpms-site-visit.ics',
            content: calendarInvite,
            contentType: 'text/calendar; method=REQUEST; charset=UTF-8',
          },
        ]
      : []),
  ];

  let info;
  try {
    info = await transporter.sendMail({
      from: `"QPMS CRM" <${process.env.EMAIL_USER}>`,
      to,
      cc,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    console.error('[QPMS Mail API] sendMail failed', {
      type,
      to,
      cc,
      subject,
      message: error.message,
      code: error.code,
      command: error.command,
    });
    return {
      ok: true,
      simulated: true,
      message: 'MOM email simulated successfully. SMTP failed but demo flow continued.',
      smtpError: error.message,
      calendarInviteSent: false,
    };
  }

  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, calendarInviteSent: Boolean(calendarInvite) };
}

function buildDefaultHtml(payload, type) {
  const title = type === 'lead' ? 'Lead Minutes of Meeting' : 'Site Visit Minutes of Meeting';
  if (type === 'lead') return buildLeadMomHtml(payload, title);
  const rows = [
    ['Client', payload.clientName || payload.client_name || payload.company || 'QPMS Client'],
    ['Discussion Summary', payload.discussionSummary || payload.discussion_summary || payload.summary || ''],
    ['Service Scope', payload.serviceScopeDiscussion || payload.service_scope_discussion || payload.scope || ''],
    ['Action Items', payload.actionItems || payload.action_items || payload.nextAction || ''],
    ['Remarks', payload.remarks || payload.siteVisitRemarks || payload.site_visit_remarks || ''],
  ];

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#172033;line-height:1.55">
      <h2 style="color:#2444a4;margin:0 0 16px">${title}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:760px">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border:1px solid #e2e8f0;background:#f8fafc;padding:10px 12px;font-weight:700;width:190px">${label}</td>
                <td style="border:1px solid #e2e8f0;padding:10px 12px;white-space:pre-line">${value || '-'}</td>
              </tr>
            `,
          )
          .join('')}
      </table>
      <p style="margin-top:18px;color:#64748b">Sent from QPMS CRM workflow system.</p>
    </div>
  `;
}

function buildLeadMomHtml(payload, title) {
  const serviceScope = normalizeServiceScope(payload.serviceScope || payload.service_scope || payload.serviceScopeDiscussion || payload.service_scope_discussion);
  const scheduleRows = hasSiteVisitSchedule(payload)
    ? [
        ['Scheduled Site Visit Date', payload.scheduledVisitDate || payload.scheduled_site_visit_date],
        ['Scheduled Site Visit Time', payload.scheduledVisitTime || payload.scheduled_site_visit_time],
      ]
    : [['Next Follow-up Date', payload.nextFollowUpDate || payload.next_followup_date]];
  const rows = [
    ['Client', payload.clientName || payload.client_name || payload.company || 'QPMS Client'],
    ['Primary Contact', payload.primaryContact || payload.primary_contact || payload.contact || payload.to || ''],
    ['Discussion Summary', payload.discussionSummary || payload.discussion_summary || payload.summary || ''],
    ['Service Scope', serviceScope.length ? `<ul style="margin:0;padding-left:18px">${serviceScope.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '-'],
    ['Remarks', payload.remarks || payload.siteVisitRemarks || payload.site_visit_remarks || ''],
    ...scheduleRows,
  ];

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#172033;line-height:1.55">
      <h2 style="color:#2444a4;margin:0 0 16px">${escapeHtml(title)}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:760px">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border:1px solid #e2e8f0;background:#f8fafc;padding:10px 12px;font-weight:700;width:190px">${escapeHtml(label)}</td>
                <td style="border:1px solid #e2e8f0;padding:10px 12px;white-space:pre-line">${label === 'Service Scope' ? value : escapeHtml(value || '-')}</td>
              </tr>
            `,
          )
          .join('')}
      </table>
      <p style="margin-top:18px;color:#64748b">Sent from QPMS CRM workflow system.</p>
    </div>
  `;
}

function routeSendMom(type) {
  return async (request, response) => {
    try {
      if (type === 'lead') {
        console.log('[QPMS Mail API] /send-lead-mom hit', {
          to: request.body?.to || request.body?.toEmail || request.body?.to_email || '',
          subject: request.body?.subject || '',
        });
      }

      const result = await sendMomEmail(request.body, type);
      response.json({ ok: true, ...result });
    } catch (error) {
      if (!error.statusCode) {
        console.error('[QPMS Mail API] MOM email simulated after delivery failure', {
          type,
          message: error.message,
          code: error.code,
          command: error.command,
        });
        response.json({
          ok: true,
          simulated: true,
          message: 'MOM email simulated successfully. SMTP failed but demo flow continued.',
          smtpError: error.message,
        });
        return;
      }
      response.status(error.statusCode || 500).json({ ok: false, message: error.message || 'Email failed' });
    }
  };
}

app.get('/', (request, response) => {
  response.json({ success: true, message: 'QPMS Mail API running' });
});

app.get('/health', (request, response) => {
  response.json({ ok: true, service: 'qpms-mail-api' });
});

app.post('/api/test/reset', (request, response) => {
  approvalMatrixStore.tokens.clear();
  approvalMatrixStore.leads.clear();
  approvalMatrixStore.siteVisits.clear();
  approvalMatrixStore.approvals.clear();
  approvalMatrixStore.events = [];
  response.json({ ok: true, message: 'Approval matrix test store reset.' });
});

app.post('/api/auth/login', (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '');
  const user = apiDemoUsers.find((item) => item.email === email && item.password === password);
  if (!user) {
    response.status(401).json({ ok: false, message: 'Invalid demo credentials.' });
    return;
  }

  const token = createToken(user);
  response.json({
    ok: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

app.post('/api/leads', requireApiAuth, requireRoles(['BD Executive', 'BD Head', 'Admin']), (request, response) => {
  const now = new Date().toISOString();
  const lead = {
    id: createApiId('lead'),
    leadId: '',
    company: request.body?.company || request.body?.clientName || 'Postman Demo Client',
    primaryContact: request.body?.primaryContact || 'Demo Contact',
    primaryContactEmail: request.body?.primaryContactEmail || 'demo.client@example.com',
    primaryContactPhone: request.body?.primaryContactPhone || '+91 90000 00000',
    industryType: request.body?.industryType || 'Facility Management',
    state: request.body?.state || 'Tamil Nadu',
    city: request.body?.city || 'Chennai',
    leadSource: request.body?.leadSource || 'Postman Automation',
    leadPriority: request.body?.leadPriority || 'High',
    serviceScope: request.body?.serviceScope || ['Soft Services Housekeeping', 'Security Services'],
    status: 'Active',
    leadStage: 'New Lead',
    createdBy: request.apiUser.email,
    createdAt: now,
    updatedAt: now,
  };
  lead.leadId = lead.id;
  approvalMatrixStore.leads.set(lead.id, lead);
  addApprovalEvent('Lead Created', { leadId: lead.id, actor: request.apiUser.email });
  response.status(201).json({ ok: true, leadId: lead.id, lead });
});

app.post('/api/leads/:leadId/site-visit', requireApiAuth, requireRoles(['BD Executive', 'BD Head', 'Admin']), (request, response) => {
  const lead = approvalMatrixStore.leads.get(request.params.leadId);
  if (!lead) {
    response.status(404).json({ ok: false, message: 'Lead not found.' });
    return;
  }

  const existing = [...approvalMatrixStore.siteVisits.values()].find((visit) => visit.leadId === lead.id);
  if (existing) {
    response.json({ ok: true, siteVisitId: existing.id, siteVisit: existing, reused: true });
    return;
  }

  const now = new Date().toISOString();
  const siteVisit = {
    id: createApiId('sv'),
    siteVisitId: '',
    leadId: lead.id,
    company: lead.company,
    location: request.body?.location || `${lead.city}, ${lead.state}`,
    scheduledVisitDate: request.body?.scheduledVisitDate || '',
    scheduledVisitTime: request.body?.scheduledVisitTime || '',
    assignedBdExecutive: request.apiUser.name,
    status: 'Assessment Draft',
    currentStage: 'Site Visit Started',
    pendingWith: 'BD Executive',
    approvalStatus: 'Not Submitted',
    assessment: null,
    createdAt: now,
    updatedAt: now,
  };
  siteVisit.siteVisitId = siteVisit.id;
  approvalMatrixStore.siteVisits.set(siteVisit.id, siteVisit);
  approvalMatrixStore.leads.set(lead.id, {
    ...lead,
    leadStage: 'Converted',
    status: 'Converted to Assessment',
    updatedAt: now,
  });
  addApprovalEvent('Site Visit Created', { leadId: lead.id, siteVisitId: siteVisit.id, actor: request.apiUser.email });
  response.status(201).json({ ok: true, siteVisitId: siteVisit.id, siteVisit });
});

app.post('/api/site-visits/:siteVisitId/assessment', requireApiAuth, requireRoles(['BD Executive', 'BD Head', 'Admin']), (request, response) => {
  const siteVisit = approvalMatrixStore.siteVisits.get(request.params.siteVisitId);
  if (!siteVisit) {
    response.status(404).json({ ok: false, message: 'Site visit not found.' });
    return;
  }

  const assessment = {
    manpower: request.body?.manpower || [],
    serviceScope: request.body?.serviceScope || [],
    commercial: request.body?.commercial || {},
    finance: request.body?.finance || {},
    hr: request.body?.hr || {},
    proposalValue: Number(request.body?.proposalValue || request.body?.commercial?.proposalValue || 0),
    monthlyValue: Number(request.body?.monthlyValue || request.body?.commercial?.monthlyValue || 0),
    riskLevel: request.body?.riskLevel || 'Medium',
    submittedAt: new Date().toISOString(),
  };
  const nextVisit = {
    ...siteVisit,
    assessment,
    status: 'Assessment Submitted',
    currentStage: 'Assessment Saved',
    pendingWith: 'BD Executive',
    updatedAt: new Date().toISOString(),
  };
  approvalMatrixStore.siteVisits.set(nextVisit.id, nextVisit);
  addApprovalEvent('Assessment Submitted', { siteVisitId: nextVisit.id, actor: request.apiUser.email });
  response.json({ ok: true, siteVisitId: nextVisit.id, assessment, siteVisit: nextVisit });
});

app.post('/api/site-visits/:siteVisitId/submit-approval-matrix', requireApiAuth, requireRoles(['BD Executive', 'BD Head', 'Admin']), (request, response) => {
  const siteVisit = approvalMatrixStore.siteVisits.get(request.params.siteVisitId);
  if (!siteVisit) {
    response.status(404).json({ ok: false, message: 'Site visit not found.' });
    return;
  }
  if (!siteVisit.assessment) {
    response.status(400).json({ ok: false, message: 'Assessment must be submitted before approval matrix.' });
    return;
  }
  if (!Array.isArray(siteVisit.assessment.manpower) || !siteVisit.assessment.manpower.length) {
    response.status(400).json({ ok: false, message: 'Missing manpower data. Add manpower rows before submitting approval matrix.' });
    return;
  }

  const approvals = ensureApprovalMatrix(siteVisit);
  const nextVisit = syncSiteVisitWorkflow(siteVisit.id);
  addApprovalEvent('Approval Matrix Submitted', { siteVisitId: siteVisit.id, actor: request.apiUser.email });
  response.json({
    ok: true,
    leadId: siteVisit.leadId,
    siteVisitId: siteVisit.id,
    approvalId: approvals[0]?.id || '',
    approvals,
    workflow: calculateWorkflowStatus(siteVisit.id),
    siteVisit: nextVisit,
  });
});

app.get('/api/approvals/queue', requireApiAuth, (request, response) => {
  const requestedDepartment = request.query.department || reviewerRoleToDepartment[request.apiUser.role];
  if (!requestedDepartment) {
    response.status(400).json({ ok: false, message: 'department query is required for this role.' });
    return;
  }

  if (request.apiUser.role !== 'Admin' && reviewerRoleToDepartment[request.apiUser.role] !== requestedDepartment) {
    response.status(403).json({ ok: false, message: `${request.apiUser.role} cannot view ${requestedDepartment} queue.` });
    return;
  }

  const queue = [...approvalMatrixStore.approvals.values()]
    .filter((approval) => approval.department === requestedDepartment && approval.status === 'Pending')
    .map((approval) => ({
      ...approval,
      siteVisit: approvalMatrixStore.siteVisits.get(approval.siteVisitId),
      lead: approvalMatrixStore.leads.get(approval.leadId),
    }));

  response.json({ ok: true, department: requestedDepartment, count: queue.length, approvals: queue });
});

app.post('/api/approvals/:approvalId/decision', requireApiAuth, (request, response) => {
  const approval = approvalMatrixStore.approvals.get(request.params.approvalId);
  if (!approval) {
    response.status(404).json({ ok: false, message: 'Approval not found.' });
    return;
  }

  if (request.apiUser.role !== 'Admin' && request.apiUser.role !== approval.assignedRole) {
    response.status(403).json({ ok: false, message: `${request.apiUser.role} cannot decide ${approval.department} approval.` });
    return;
  }

  const decision = normalizeDecision(request.body?.decision);
  if (!decision) {
    response.status(400).json({ ok: false, message: 'decision must be approve, reject, or rework.' });
    return;
  }

  const nextApproval = {
    ...approval,
    status: decision,
    remarks: request.body?.remarks || '',
    approvedBy: request.apiUser.email,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  approvalMatrixStore.approvals.set(nextApproval.id, nextApproval);
  const nextVisit = syncSiteVisitWorkflow(nextApproval.siteVisitId);
  addApprovalEvent('Approval Decision', {
    siteVisitId: nextApproval.siteVisitId,
    approvalId: nextApproval.id,
    department: nextApproval.department,
    decision,
    actor: request.apiUser.email,
  });

  response.json({
    ok: true,
    approvalId: nextApproval.id,
    approval: nextApproval,
    workflow: calculateWorkflowStatus(nextApproval.siteVisitId),
    siteVisit: nextVisit,
  });
});

app.get('/api/workflows/:siteVisitId/status', requireApiAuth, (request, response) => {
  const siteVisit = approvalMatrixStore.siteVisits.get(request.params.siteVisitId);
  if (!siteVisit) {
    response.status(404).json({ ok: false, message: 'Site visit not found.' });
    return;
  }

  response.json({
    ok: true,
    lead: approvalMatrixStore.leads.get(siteVisit.leadId),
    siteVisit,
    approvals: getSiteVisitApprovals(siteVisit.id),
    workflow: calculateWorkflowStatus(siteVisit.id),
    events: approvalMatrixStore.events.filter((event) => event.siteVisitId === siteVisit.id || event.leadId === siteVisit.leadId),
  });
});

app.post('/send-lead-mom', routeSendMom('lead'));
app.post('/send-sitevisit-mom', routeSendMom('sitevisit'));

app.listen(port, () => {
  console.log('[QPMS Mail API] Startup complete', {
    port,
    allowedOrigins,
    emailUserConfigured: Boolean(process.env.EMAIL_USER),
    emailPassConfigured: Boolean(process.env.EMAIL_PASS),
  });
  verifyMailTransporter();
});
