const WORKFLOW_STAGE_ORDER = [
  'site_visit_started',
  'operations_review',
  'coordinator_costing_review',
  'hr_validation',
  'commercial_review',
  'finance_review',
  'returned_to_bd',
  'proposal_sent',
];

const STAGE_NAME_TO_CODE = {
  'Site Visit Started': 'site_visit_started',
  'Pre-Operational Assessment': 'site_visit_started',
  'Operations Review': 'operations_review',
  'Coordinator Costing Review': 'coordinator_costing_review',
  'HR Validation': 'hr_validation',
  'Commercial Review': 'commercial_review',
  'Finance Review': 'finance_review',
  'Returned to BD': 'returned_to_bd',
  'Proposal Sent': 'proposal_sent',
};

function createValidationResult(name, findings = []) {
  const errors = findings.filter((item) => item.severity === 'error');
  const warnings = findings.filter((item) => item.severity === 'warning');
  if (errors.length || warnings.length) {
    console.warn(`[myQPMS Workflow Validation] ${name}`, { errors: errors.length, warnings: warnings.length, findings });
  }
  return {
    name,
    passed: errors.length === 0,
    errors,
    warnings,
    findings,
  };
}

function normalizeStage(stage) {
  return STAGE_NAME_TO_CODE[stage] || stage || '';
}

function itemId(item) {
  return item?.id || item?.leadId || item?.siteVisitId || item?.workflowInstanceId || 'unknown';
}

export function validatePendingAssignments(assignments = []) {
  const grouped = new Map();
  assignments
    .filter((assignment) => assignment?.status === 'Pending')
    .forEach((assignment) => {
      const key = `${assignment.workflow_instance_id || assignment.workflowInstanceId || ''}:${assignment.stage_code || assignment.stageCode || ''}`;
      grouped.set(key, [...(grouped.get(key) || []), assignment]);
    });

  const findings = [...grouped.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({
      severity: 'error',
      code: 'duplicate_pending_assignment',
      message: 'Multiple pending assignments found for the same workflow stage.',
      key,
      ids: items.map(itemId),
    }));

  return createValidationResult('validatePendingAssignments', findings);
}

export function validateWorkflowStageAlignment(siteVisits = []) {
  const findings = siteVisits.flatMap((visit) => {
    const cachedStage = normalizeStage(visit.currentStage);
    const workflowStage = normalizeStage(visit.workflowStageCode);
    const pendingWith = visit.pendingWith || '';
    const activeAssignmentRole = visit.activeAssignment?.assigned_role || visit.activeAssignment?.assignedRole || visit.assignmentRole || '';
    const visitFindings = [];

    if (workflowStage && cachedStage && workflowStage !== cachedStage) {
      visitFindings.push({
        severity: 'warning',
        code: 'cached_stage_mismatch',
        message: 'Cached site visit stage does not match canonical workflow stage.',
        siteVisitId: visit.id,
        cachedStage,
        workflowStage,
      });
    }

    if (activeAssignmentRole && pendingWith && activeAssignmentRole !== pendingWith) {
      visitFindings.push({
        severity: 'warning',
        code: 'pending_with_mismatch',
        message: 'Displayed pending-with value does not match active assignment role.',
        siteVisitId: visit.id,
        pendingWith,
        activeAssignmentRole,
      });
    }

    return visitFindings;
  });

  return createValidationResult('validateWorkflowStageAlignment', findings);
}

export function validateAssessmentPersistence(before = {}, after = {}) {
  const findings = [];
  const beforeKeys = Object.keys(before || {}).filter((key) => before[key] !== undefined && before[key] !== null && before[key] !== '');
  const afterKeys = Object.keys(after || {}).filter((key) => after[key] !== undefined && after[key] !== null && after[key] !== '');
  const missingKeys = beforeKeys.filter((key) => !afterKeys.includes(key));

  if (beforeKeys.length && !afterKeys.length) {
    findings.push({
      severity: 'error',
      code: 'assessment_cleared',
      message: 'Assessment data appears to have been cleared after save or refresh.',
      beforeKeys,
    });
  } else if (missingKeys.length) {
    findings.push({
      severity: 'warning',
      code: 'assessment_keys_missing',
      message: 'Some assessment fields existed before save but are missing after reload.',
      missingKeys,
    });
  }

  return createValidationResult('validateAssessmentPersistence', findings);
}

export function validateDuplicateProtection({ leads = [], siteVisits = [], contacts = [] } = {}) {
  const findings = [];
  const visitsByLead = new Map();
  const primaryContactsByLead = new Map();

  siteVisits.forEach((visit) => {
    if (!visit?.leadId && !visit?.lead_id) return;
    const leadId = visit.leadId || visit.lead_id;
    visitsByLead.set(leadId, [...(visitsByLead.get(leadId) || []), visit]);
  });

  contacts.forEach((contact) => {
    if (!contact?.isPrimary && !contact?.is_primary) return;
    const leadId = contact.leadId || contact.lead_id;
    if (!leadId) return;
    primaryContactsByLead.set(leadId, [...(primaryContactsByLead.get(leadId) || []), contact]);
  });

  visitsByLead.forEach((items, leadId) => {
    if (items.length > 1) {
      findings.push({
        severity: 'error',
        code: 'duplicate_site_visit_for_lead',
        message: 'A lead has multiple site visit records.',
        leadId,
        siteVisitIds: items.map(itemId),
      });
    }
  });

  primaryContactsByLead.forEach((items, leadId) => {
    if (items.length > 1) {
      findings.push({
        severity: 'error',
        code: 'duplicate_primary_contact_for_lead',
        message: 'A lead has multiple primary contacts.',
        leadId,
        contactIds: items.map(itemId),
      });
    }
  });

  const convertedVisibleLeads = leads.filter((lead) => ['Converted', 'Converted to Assessment'].includes(lead.stage) && lead.status !== 'Archived');
  if (convertedVisibleLeads.length) {
    findings.push({
      severity: 'warning',
      code: 'converted_leads_visible',
      message: 'Converted leads are still visible in the active lead set passed to validation.',
      leadIds: convertedVisibleLeads.map(itemId),
    });
  }

  return createValidationResult('validateDuplicateProtection', findings);
}

export function validateWorkflowConsistency({ leads = [], siteVisits = [], assignments = [], contacts = [] } = {}) {
  const findings = [];
  const pendingResult = validatePendingAssignments(assignments);
  const alignmentResult = validateWorkflowStageAlignment(siteVisits);
  const duplicateResult = validateDuplicateProtection({ leads, siteVisits, contacts });

  siteVisits.forEach((visit) => {
    const stageCode = normalizeStage(visit.workflowStageCode || visit.currentStage);
    if (stageCode && !WORKFLOW_STAGE_ORDER.includes(stageCode)) {
      findings.push({
        severity: 'warning',
        code: 'unknown_stage',
        message: 'Site visit references an unknown workflow stage.',
        siteVisitId: visit.id,
        stageCode,
      });
    }
  });

  return createValidationResult('validateWorkflowConsistency', [
    ...pendingResult.findings,
    ...alignmentResult.findings,
    ...duplicateResult.findings,
    ...findings,
  ]);
}
