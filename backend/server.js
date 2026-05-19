import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';

dotenv.config({ path: './backend/.env' });

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: '10mb' }));

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS are required');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
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

  const info = await transporter.sendMail({
    from: `"QPMS CRM" <${process.env.EMAIL_USER}>`,
    to,
    cc,
    subject,
    html,
    attachments,
  });

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

app.post('/send-lead-mom', routeSendMom('lead'));
app.post('/send-sitevisit-mom', routeSendMom('sitevisit'));

app.listen(port, () => {
  console.log('[QPMS Mail API] Startup complete', {
    port,
    frontendOrigin,
    emailUserConfigured: Boolean(process.env.EMAIL_USER),
    emailPassConfigured: Boolean(process.env.EMAIL_PASS),
  });
});
