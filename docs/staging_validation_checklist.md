# QPMS CRM Staging Validation Checklist

## Purpose

Use this checklist before moving the workflow foundation to production. Phase 3.5 does not change UI behavior; it validates the database/RPC foundation created in Phase 1, Phase 2, and Phase 3.

## 1. Migration Execution Order

Run only in staging first.

1. Backup Supabase schema and data.
2. Run `database/backup/pre_migration_checks.sql`.
3. Resolve duplicate or orphan rows if any are reported.
4. Run migrations in order:
   - `database/migrations/002_workflow_engine.sql`
   - `database/migrations/004_notifications.sql`
   - `database/migrations/006_assessment_section_safety.sql`
   - `database/migrations/007_proposal_foundation.sql`
   - `database/migrations/008_safe_unique_constraints_indexes.sql`
   - `database/migrations/009_workflow_rpc_functions.sql`
5. Run `database/seed/workflow_stages_seed.sql`.
6. Run `database/backup/post_migration_validation.sql`.

## 2. Environment Validation

Confirm staging environment variables:

- `VITE_APP_MODE=production` for production-like staging validation.
- `VITE_SUPABASE_URL` is set.
- `VITE_SUPABASE_ANON_KEY` is set.
- Mail backend URL remains configured separately through `VITE_API_URL`.

Use `validateEnvironment()` from `src/utils/environmentValidation.js`.

## 3. RPC Validation

Use `checkRpcAvailability()` from `src/utils/environmentValidation.js`.

Expected RPC functions:

- `rpc_convert_lead_to_assessment`
- `rpc_save_assessment_section`
- `rpc_submit_for_review`
- `rpc_record_approval_decision`
- `rpc_create_notification`
- `rpc_mark_notification_read`
- `rpc_generate_proposal_record`
- `rpc_log_workflow_event`

Any missing RPC blocks production migration.

## 4. Approval Routing Tests

Use `runStagingWorkflowSmokeTests()` from `src/utils/stagingWorkflowTests.js` with staging-only test records.

Required checks:

- Submit assessment to Operations Review.
- Approve Operations Review.
- Confirm next pending assignment is created.
- Confirm workflow event is created.
- Confirm notification is created for next pending owner.

## 5. Duplicate Prevention Tests

Validate:

- same lead cannot create multiple active site visits
- same idempotency key returns the same conversion result
- only one pending assignment exists per workflow stage
- primary contact duplication is blocked or reused

Use:

- `testDuplicateLeadConversion()`
- `validateDuplicateProtection()`
- `validatePendingAssignments()`

## 6. Assessment Save Tests

Validate:

- draft save works
- section save works
- stale version save is rejected
- unrelated sections are not cleared
- data persists after refresh

Use:

- `testAssessmentSave()`
- `validateAssessmentPersistence()`

## 7. Proposal Generation Tests

Validate:

- proposal header is created
- proposal version is created
- proposal line items are stored when provided
- workflow event is logged
- duplicate proposal generation with the same idempotency key does not duplicate output

Use:

- `testProposalGeneration()`

## 8. Notification Tests

Validate:

- notification can be created for role or user
- notification log is created
- notification can be marked read
- no UI notification bell changes are required for this phase

Use:

- `testNotificationCreation()`

## 9. Workflow Consistency Checks

Use `src/utils/workflowValidation.js` to verify:

- cached `site_visits.current_stage` aligns with canonical workflow stage
- pending-with aligns with active workflow assignment
- no duplicate active pending assignments
- converted leads do not remain in active lead sets

## 10. Rollback Plan

If staging validation fails:

1. Stop frontend production rollout.
2. Keep existing demo/legacy workflow active.
3. Capture failing SQL/RPC response.
4. Restore staging database from backup if needed.
5. Fix migration/RPC in a new additive migration.
6. Re-run pre-checks, migrations, seed, and validation.

Do not apply failed migration changes directly to production.

## Production Blockers

Do not proceed to production until:

- all Phase 1 tables exist
- all Phase 2 RPC functions exist
- workflow stage seed rows exist
- environment validation passes
- RPC availability passes
- duplicate prevention tests pass
- assessment persistence tests pass
- approval routing tests pass
- notification tests pass
- proposal generation tests pass

