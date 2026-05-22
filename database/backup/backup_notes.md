# Backup Notes

## Purpose

Track planned backup strategy, restore checks, retention policy, and Supabase/AWS migration backup considerations.

## Notes

- Keep production exports outside Git.
- Document backup owner, cadence, and restore validation steps before go-live.
- Before applying Phase 1 workflow foundation migrations, export current Supabase schema and data snapshots for:
  - leads
  - lead_contacts
  - lead_mom
  - site_visits
  - site_assessments
  - approval_requests
  - activity_logs
- Check duplicate rows before applying unique indexes:
  - duplicate `site_visits.lead_id`
  - duplicate `lead_mom.lead_id`
  - duplicate `site_assessments.site_visit_id`
  - multiple primary contacts per lead/assessment
- Phase 1 migrations are additive and should not be executed automatically from the app.
- After migration review, apply to a staging Supabase project first and verify existing demo workflow still loads.
