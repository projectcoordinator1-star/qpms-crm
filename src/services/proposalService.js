const proposalTemplatePath = 'C:/Users/Vignesh/Downloads/New Business Proposal Format.xlsx';

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadBlob({ content, mimeType, filename }) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildProposalRows(assessment) {
  const manpower = assessment?.survey?.manpowerPlan || [];
  const managementFee = safeNumber(assessment?.survey?.commercial?.managementFee || assessment?.survey?.commercial?.management_fee || 0);

  return manpower.map((row) => {
    const quantity = safeNumber(row.count ?? row.quantity ?? row.qty ?? row.headCount, 0);
    const ratePerHead = safeNumber(row.finalBillableValue ?? row.ratePerHead ?? row.rate_per_head ?? row.monthlyRate, 0);
    return {
      designation: row.designation || row.department || '',
      quantity,
      shift: row.shiftType || row.shift || '',
      ratePerHead,
      monthlyTotal: quantity * ratePerHead,
      managementFee,
      contractValue: quantity * ratePerHead * 12,
      wageCategory: row.wageCategory || row.wage_category || '',
      gender: row.gender || '',
    };
  });
}

export function getProposalTemplateMetadata() {
  return {
    templatePath: proposalTemplatePath,
    supportedExports: ['Excel', 'PDF'],
    workbookSheets: ['T&C', 'TCC List', 'Proposal commercial sheets'],
    status: 'Template mapped for proposal engine integration',
  };
}

export function buildProposalExportModel(proposal, visit = {}) {
  const lineItems = proposal?.lineItems || [];
  return {
    proposalNumber: proposal?.proposalNumber || '',
    clientName: proposal?.clientName || visit.company || '',
    siteDetails: proposal?.siteDetails || [
      visit.siteName || visit.location,
      visit.city,
      visit.state,
    ].filter(Boolean).join(', '),
    scopeOfWork: proposal?.scopeOfWork || [],
    manpowerRequirement: proposal?.manpowerRequirement || lineItems,
    costingSummary: proposal?.costingSummary || {},
    commercialNotes: proposal?.commercialNotes || '',
    approvalStatus: proposal?.approvalStatus || visit.approvalStatus || visit.status || '',
    monthlyValue: proposal?.monthlyValue || 0,
    proposalValue: proposal?.proposalValue || 0,
    marginPercent: proposal?.marginPercent || 0,
    lineItems,
  };
}

export function exportProposalToExcel(proposal, visit) {
  const model = buildProposalExportModel(proposal, visit);
  const scope = Array.isArray(model.scopeOfWork) ? model.scopeOfWork.join(', ') : model.scopeOfWork;
  const rows = model.lineItems.length ? model.lineItems : model.manpowerRequirement;
  const tableRows = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.designation || 'IFM Services')}</td>
      <td>${escapeHtml(row.quantity ?? '')}</td>
      <td>${escapeHtml(row.shift || row.shiftType || '')}</td>
      <td>${escapeHtml(row.wageCategory || '')}</td>
      <td>${escapeHtml(row.gender || '')}</td>
      <td>${safeNumber(row.ratePerHead).toFixed(2)}</td>
      <td>${safeNumber(row.monthlyTotal).toFixed(2)}</td>
      <td>${safeNumber(row.contractValue).toFixed(2)}</td>
    </tr>
  `).join('');
  const workbook = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table>
          <tr><th colspan="8">myQPMS Business Proposal</th></tr>
          <tr><td>Proposal No.</td><td colspan="7">${escapeHtml(model.proposalNumber)}</td></tr>
          <tr><td>Client</td><td colspan="7">${escapeHtml(model.clientName)}</td></tr>
          <tr><td>Site Details</td><td colspan="7">${escapeHtml(model.siteDetails)}</td></tr>
          <tr><td>Scope of Work</td><td colspan="7">${escapeHtml(scope)}</td></tr>
          <tr><td>Approval Status</td><td colspan="7">${escapeHtml(model.approvalStatus)}</td></tr>
          <tr><td>Commercial Notes</td><td colspan="7">${escapeHtml(model.commercialNotes)}</td></tr>
          <tr><td>Monthly Value</td><td colspan="7">${safeNumber(model.monthlyValue).toFixed(2)}</td></tr>
          <tr><td>Annual Contract Value</td><td colspan="7">${safeNumber(model.proposalValue).toFixed(2)}</td></tr>
          <tr><td>Margin %</td><td colspan="7">${safeNumber(model.marginPercent).toFixed(2)}</td></tr>
          <tr></tr>
          <tr>
            <th>Designation</th><th>Qty</th><th>Shift</th><th>Wage Category</th><th>Gender</th>
            <th>Rate / Head</th><th>Monthly Total</th><th>Contract Value</th>
          </tr>
          ${tableRows}
        </table>
      </body>
    </html>
  `;
  downloadBlob({
    content: workbook,
    mimeType: 'application/vnd.ms-excel;charset=utf-8',
    filename: `${model.proposalNumber || 'myQPMS-Proposal'}.xls`,
  });
}

export function exportProposalToPdf(proposal, visit) {
  const model = buildProposalExportModel(proposal, visit);
  const scope = Array.isArray(model.scopeOfWork) ? model.scopeOfWork.join(', ') : model.scopeOfWork;
  const rows = model.lineItems.length ? model.lineItems : model.manpowerRequirement;
  const rowMarkup = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.designation || 'IFM Services')}</td>
      <td>${escapeHtml(row.quantity ?? '')}</td>
      <td>${escapeHtml(row.shift || row.shiftType || '')}</td>
      <td>${escapeHtml(row.wageCategory || '')}</td>
      <td>${safeNumber(row.ratePerHead).toLocaleString('en-IN')}</td>
      <td>${safeNumber(row.monthlyTotal).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');
  const printable = `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(model.proposalNumber || 'myQPMS Proposal')}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
          h1 { margin: 0 0 4px; color: #2446a6; }
          .muted { color: #64748b; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
          .box { border: 1px solid #dbe3ef; border-radius: 10px; padding: 12px; }
          .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
          .value { margin-top: 4px; font-size: 14px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { border: 1px solid #dbe3ef; padding: 9px; text-align: left; font-size: 12px; }
          th { background: #f8fafc; color: #334155; text-transform: uppercase; font-size: 11px; }
          @media print { button { display: none; } body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="float:right;padding:8px 12px;border-radius:8px;border:1px solid #cbd5e1;background:#2446a6;color:white;">Save as PDF</button>
        <h1>myQPMS Business Proposal</h1>
        <p class="muted">${escapeHtml(model.proposalNumber)}</p>
        <div class="grid">
          <div class="box"><div class="label">Client</div><div class="value">${escapeHtml(model.clientName)}</div></div>
          <div class="box"><div class="label">Site Details</div><div class="value">${escapeHtml(model.siteDetails)}</div></div>
          <div class="box"><div class="label">Scope of Work</div><div class="value">${escapeHtml(scope)}</div></div>
          <div class="box"><div class="label">Approval Status</div><div class="value">${escapeHtml(model.approvalStatus)}</div></div>
          <div class="box"><div class="label">Monthly Value</div><div class="value">INR ${safeNumber(model.monthlyValue).toLocaleString('en-IN')}</div></div>
          <div class="box"><div class="label">Annual Contract Value</div><div class="value">INR ${safeNumber(model.proposalValue).toLocaleString('en-IN')}</div></div>
        </div>
        <div class="box"><div class="label">Commercial Notes</div><div class="value">${escapeHtml(model.commercialNotes || '-')}</div></div>
        <table>
          <thead><tr><th>Designation</th><th>Qty</th><th>Shift</th><th>Wage Category</th><th>Rate / Head</th><th>Monthly Total</th></tr></thead>
          <tbody>${rowMarkup}</tbody>
        </table>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=980,height=720');
  if (!printWindow) {
    throw new Error('Popup blocked. Allow popups to export the proposal PDF.');
  }
  printWindow.document.write(printable);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}
