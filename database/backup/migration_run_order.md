# QPMS CRM Phase 1 Migration Run Order

## Purpose

This guide explains the safe execution order for the additive Phase 1 database foundation migrations.

Do not run these migrations directly from the app. Apply them manually in a reviewed Supabase SQL session or through the approved database deployment process.

## 1. Backup Supabase

Before applying any migration, take a backup/export of the current Supabase project.

Minimum tables to export:

- `leads`
- `lead_contacts`
- `lead_mom`
- `site_visits`
- `site_assessments`
- `site_mom`
- `approval_requests`
- `activity_logs`
- `assessment_audit_logs`

Also export the current schema if available.

## 2. Run Pre-Migration Checks

Run:

```sql
database/backup/pre_migration_checks.sql
```

Review results for:

- duplicate `site_visits.lead_id`
- duplicate `lead_mom.lead_id`
- duplicate `site_assessments.site_visit_id`
- duplicate primary contacts per lead
- duplicate primary contacts per assessment
- orphan site visits
- orphan assessments
- current approval request volume

If duplicate or orphan rows are returned, decide whether to clean them before running the unique constraint/index migration.

## 3. Run Migrations One By One

Run migrations manually in this order:

1. `database/migrations/002_workflow_engine.sql`
2. `database/migrations/004_notifications.sql`
3. `database/migrations/006_assessment_section_safety.sql`
4. `database/migrations/007_proposal_foundation.sql`
5. `database/migrations/008_safe_unique_constraints_indexes.sql`

Notes:

- These migrations are additive.
- They do not remove existing tables.
- The safe unique index migration may emit `NOTICE` messages and skip indexes if duplicate legacy data exists.
- If an index is skipped, fix the duplicate data and re-run `008_safe_unique_constraints_indexes.sql`.

## 4. Run Workflow Stage Seed

After `workflow_stages` exists, run:

```sql
database/seed/workflow_stages_seed.sql
```

Expected stages:

1. Lead MOM
2. Site Visit Started
3. Operations Review
4. Coordinator Costing Review
5. HR Validation
6. Commercial Review
7. Finance Review
8. Returned to BD
9. Proposal Sent

## 5. Run Post-Migration Validation

Run:

```sql
database/backup/post_migration_validation.sql
```

Confirm:

- all new foundation tables exist
- workflow stages are seeded
- expected indexes exist
- old tables still exist
- no duplicate active pending workflow assignments exist

## 6. Continue Only Then To RPC Phase 2

Do not start RPC/function implementation until:

- backup is completed
- pre-check results are reviewed
- migrations are applied successfully
- workflow stages are seeded
- post-validation passes
- existing demo workflow still loads in the app

RPC Phase 2 should then add atomic operations for:

- idempotent lead conversion
- section-level assessment saves
- review submission
- approval decisions
- notification creation

