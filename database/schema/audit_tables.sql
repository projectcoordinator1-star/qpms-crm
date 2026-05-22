-- QPMS CRM Audit Tables
-- Purpose: Centralized audit reference for workflow, approval, assessment, notification, and proposal actions.
-- Source migrations:
--   database/migrations/002_workflow_engine.sql
--   database/migrations/006_assessment_section_safety.sql

-- Canonical audit/event tables added in Phase 1:
--   workflow_events
--   assessment_section_versions
--
-- Existing audit tables retained:
--   activity_logs
--   assessment_audit_logs
--   assessment_edit_logs
--   workflow_activity_logs

-- Audit rule:
--   Critical workflow actions should capture actor, role, timestamp, previous state, and new state.

