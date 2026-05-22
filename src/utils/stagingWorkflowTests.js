import {
  convertLeadToAssessment,
  createNotification,
  generateProposalRecord,
  recordApprovalDecision,
  saveAssessmentSection,
  submitForReview,
} from '../services/workflowRepository.js';
import { checkRpcAvailability, validateEnvironment } from './environmentValidation.js';

function pass(name, details = {}) {
  return { name, passed: true, details };
}

function fail(name, error, details = {}) {
  console.warn(`[QPMS Staging Workflow Test] ${name} failed`, { error, details });
  return {
    name,
    passed: false,
    error: error?.message || String(error),
    details,
  };
}

function skip(name, reason, details = {}) {
  return { name, passed: true, skipped: true, reason, details };
}

function stagingKey(scope) {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `staging:${scope}:${suffix}`;
}

function requireFixture(name, fixture, requiredFields) {
  const missing = requiredFields.filter((field) => !fixture?.[field]);
  if (missing.length) {
    return skip(name, `Missing fixture fields: ${missing.join(', ')}`, { requiredFields });
  }
  return null;
}

export async function testLeadConversion({ lead, user, dryRun = false } = {}) {
  const name = 'testLeadConversion';
  const fixtureCheck = requireFixture(name, lead, ['id', 'company']);
  if (fixtureCheck) return fixtureCheck;
  if (dryRun) return skip(name, 'Dry run enabled. No conversion RPC executed.', { leadId: lead.id });

  try {
    const result = await convertLeadToAssessment(lead, {
      user,
      idempotencyKey: stagingKey('lead-conversion'),
      metadata: { staging_test: true },
    });
    return pass(name, result);
  } catch (error) {
    return fail(name, error, { leadId: lead.id });
  }
}

export async function testDuplicateLeadConversion({ lead, user, dryRun = false } = {}) {
  const name = 'testDuplicateLeadConversion';
  const fixtureCheck = requireFixture(name, lead, ['id', 'company']);
  if (fixtureCheck) return fixtureCheck;
  if (dryRun) return skip(name, 'Dry run enabled. No conversion RPC executed.', { leadId: lead.id });

  try {
    const idempotencyKey = stagingKey('duplicate-lead-conversion');
    const first = await convertLeadToAssessment(lead, { user, idempotencyKey, metadata: { staging_test: true } });
    const second = await convertLeadToAssessment(lead, { user, idempotencyKey, metadata: { staging_test: true } });
    const sameSiteVisit = first?.site_visit_id && first.site_visit_id === second?.site_visit_id;
    return sameSiteVisit
      ? pass(name, { first, second })
      : fail(name, new Error('Duplicate conversion did not return the same site_visit_id.'), { first, second });
  } catch (error) {
    return fail(name, error, { leadId: lead.id });
  }
}

export async function testAssessmentSave({ visit, user, dryRun = false } = {}) {
  const name = 'testAssessmentSave';
  const fixtureCheck = requireFixture(name, visit, ['id']);
  if (fixtureCheck) return fixtureCheck;
  if (dryRun) return skip(name, 'Dry run enabled. No assessment RPC executed.', { siteVisitId: visit.id });

  try {
    const sectionData = {
      staging_check: true,
      saved_at: new Date().toISOString(),
      note: 'Phase 3.5 assessment persistence validation',
    };
    const result = await saveAssessmentSection({
      visit,
      sectionCode: 'staging_validation',
      sectionName: 'Staging Validation',
      sectionData,
      saveMode: 'save',
      user,
      remarks: 'Staging validation save',
    });
    return pass(name, result);
  } catch (error) {
    return fail(name, error, { siteVisitId: visit.id });
  }
}

export async function testApprovalRouting({ visit, user, dryRun = false } = {}) {
  const name = 'testApprovalRouting';
  const fixtureCheck = requireFixture(name, visit, ['id']);
  if (fixtureCheck) return fixtureCheck;
  if (dryRun) return skip(name, 'Dry run enabled. No approval RPC executed.', { siteVisitId: visit.id });

  try {
    const submitted = await submitForReview({
      visit,
      targetStage: 'operations_review',
      user,
      idempotencyKey: stagingKey('submit-review'),
      remarks: 'Staging validation submit',
    });
    const decision = await recordApprovalDecision({
      visit: { ...visit, workflowInstanceId: submitted.workflow_instance_id, currentAssignmentId: submitted.assignment_id },
      stage: 'operations_review',
      decision: 'Approved',
      remarks: 'Staging validation approval',
      user,
      idempotencyKey: stagingKey('approval'),
    });
    return pass(name, { submitted, decision });
  } catch (error) {
    return fail(name, error, { siteVisitId: visit.id });
  }
}

export async function testNotificationCreation({ visit, user, dryRun = false } = {}) {
  const name = 'testNotificationCreation';
  if (dryRun) return skip(name, 'Dry run enabled. No notification RPC executed.');

  try {
    const result = await createNotification({
      recipientRole: user?.role || 'BD Team',
      workflowInstanceId: visit?.workflowInstanceId || null,
      leadId: visit?.leadId || null,
      siteVisitId: visit?.id || null,
      type: 'Staging Validation',
      title: 'Staging notification validation',
      message: 'Notification RPC validation from Phase 3.5.',
      priority: 'Low',
      metadata: { staging_test: true },
    });
    return pass(name, { notificationId: result });
  } catch (error) {
    return fail(name, error, { siteVisitId: visit?.id });
  }
}

export async function testProposalGeneration({ visit, user, dryRun = false } = {}) {
  const name = 'testProposalGeneration';
  const fixtureCheck = requireFixture(name, visit, ['id', 'workflowInstanceId']);
  if (fixtureCheck) return fixtureCheck;
  if (dryRun) return skip(name, 'Dry run enabled. No proposal RPC executed.', { siteVisitId: visit.id });

  try {
    const result = await generateProposalRecord({
      visit,
      user,
      idempotencyKey: stagingKey('proposal'),
      proposal: {
        templateName: 'Staging Validation',
        proposal_value: 0,
        remarks: 'Staging proposal validation',
        line_items: [],
      },
    });
    return pass(name, result);
  } catch (error) {
    return fail(name, error, { siteVisitId: visit.id });
  }
}

export async function runStagingWorkflowSmokeTests({ lead, visit, user, dryRun = true } = {}) {
  const environment = validateEnvironment();
  const rpcAvailability = await checkRpcAvailability();
  const tests = [
    await testLeadConversion({ lead, user, dryRun }),
    await testDuplicateLeadConversion({ lead, user, dryRun }),
    await testAssessmentSave({ visit, user, dryRun }),
    await testApprovalRouting({ visit, user, dryRun }),
    await testNotificationCreation({ visit, user, dryRun }),
    await testProposalGeneration({ visit, user, dryRun }),
  ];

  return {
    passed: environment.passed && rpcAvailability.passed && tests.every((test) => test.passed),
    environment,
    rpcAvailability,
    tests,
  };
}

