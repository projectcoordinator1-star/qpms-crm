-- QPMS CRM Approval Tables
-- Purpose: Canonical approval decisions and compatibility mapping for Commercial, Finance, HR, Operations, and Coordinator reviews.
-- Source migrations:
--   database/migrations/002_workflow_engine.sql
--   database/migrations/008_safe_unique_constraints_indexes.sql

-- Canonical Phase 1 approval table:
--   approval_decisions
--
-- Existing compatibility tables retained:
--   approval_requests
--   commercial_reviews
--   finance_reviews
--   hr_reviews
--   approval_tracking

-- Recommended usage:
--   approval_decisions stores immutable approve/rework/reject/reassign/escalate actions.
--   workflow_assignments stores the active pending queue.
--   existing review tables may store role-specific payloads, not workflow routing truth.

-- Required uniqueness:
--   approval_decisions.idempotency_key where not null

