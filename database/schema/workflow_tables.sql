-- QPMS CRM Workflow Tables
-- Purpose: Canonical workflow foundation for lead conversion, assignments, stage transitions, and timeline events.
-- Source migrations:
--   database/migrations/002_workflow_engine.sql
--   database/migrations/008_safe_unique_constraints_indexes.sql

-- Canonical tables added in Phase 1:
--   workflow_stages       Master stage list and ordering.
--   workflow_instances    One workflow per converted lead/site visit.
--   workflow_assignments  Pending-with queue records and SLA ownership.
--   workflow_transitions  Allowed stage movements by action and role.
--   workflow_events       Timeline/audit stream for workflow actions.
--   idempotency_keys      Duplicate prevention for workflow commands.

-- Required uniqueness:
--   workflow_stages.stage_code
--   workflow_stages.stage_order
--   workflow_instances.site_visit_id where not null
--   workflow_assignments(workflow_instance_id, stage_code) where status = 'Pending'
--   idempotency_keys(scope, idempotency_key)

