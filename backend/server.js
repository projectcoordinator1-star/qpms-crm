import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN || true;

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

async function sendMomEmail(payload, type) {
  const transporter = createTransporter();
  const to = normalizeRecipients(payload.to || payload.toEmail || payload.to_email);
  const cc = normalizeRecipients(payload.cc || payload.ccEmails || payload.cc_emails);

  if (!to.length) {
    const error = new Error('At least one recipient is required');
    error.statusCode = 400;
    throw error;
  }

  const subject = payload.subject || (type === 'lead' ? 'QPMS Lead MOM' : 'QPMS Site Visit MOM');
  const html = payload.html || buildDefaultHtml(payload, type);

  const info = await transporter.sendMail({
    from: `"QPMS CRM" <${process.env.EMAIL_USER}>`,
    to,
    cc,
    subject,
    html,
    attachments: payload.attachments || [],
  });

  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}

function buildDefaultHtml(payload, type) {
  const title = type === 'lead' ? 'Lead Minutes of Meeting' : 'Site Visit Minutes of Meeting';
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

function routeSendMom(type) {
  return async (request, response) => {
    try {
      const result = await sendMomEmail(request.body, type);
      response.json({ ok: true, ...result });
    } catch (error) {
      response.status(error.statusCode || 500).json({ ok: false, message: error.message || 'Email failed' });
    }
  };
}

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
