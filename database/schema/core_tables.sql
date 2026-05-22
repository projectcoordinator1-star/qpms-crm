-- QPMS CRM Core Tables
-- Purpose: Canonical schema reference for leads, contacts, site visits, proposals, and core CRM entities.
-- Source migrations:
--   database/migrations/007_proposal_foundation.sql
--   database/migrations/008_safe_unique_constraints_indexes.sql

-- Existing core tables retained:
--   leads
--   lead_contacts
--   lead_mom
--   site_visits
--   site_assessments

-- Proposal foundation tables added in Phase 1:
--   proposals
--   proposal_versions
--   proposal_line_items
--   proposal_send_logs

-- Required duplicate prevention:
--   site_visits.lead_id should be unique after duplicate cleanup.
--   lead_mom.lead_id should be unique.
--   site_assessments.site_visit_id should be unique.
--   one primary lead_contact per active lead/assessment.

