-- QPMS CRM Post-Migration Validation
-- Purpose: Run after Phase 1 foundation migrations and workflow stage seed.
-- Usage: Execute manually in Supabase SQL editor. This file does not modify data.

-- 1. Confirm all new workflow foundation tables exist
select
  expected.table_name,
  case when c.table_name is null then 'Missing' else 'Exists' end as status
from (
  values
    ('workflow_stages'),
    ('workflow_instances'),
    ('workflow_assignments'),
    ('workflow_transitions'),
    ('approval_decisions'),
    ('workflow_events'),
    ('idempotency_keys'),
    ('notifications'),
    ('notification_logs'),
    ('email_outbox'),
    ('calendar_invites'),
    ('assessment_sections'),
    ('assessment_section_versions'),
    ('assessment_drafts'),
    ('assessment_locks'),
    ('proposals'),
    ('proposal_versions'),
    ('proposal_line_items'),
    ('proposal_send_logs')
) as expected(table_name)
left join information_schema.tables c
  on c.table_schema = 'public'
 and c.table_name = expected.table_name
order by expected.table_name;

-- 2. Confirm workflow_stages has expected rows
select
  expected.stage_code,
  expected.stage_name,
  ws.stage_order,
  ws.owner_role,
  case when ws.stage_code is null then 'Missing' else 'Seeded' end as status
from (
  values
    ('lead_mom', 'Lead MOM'),
    ('site_visit_started', 'Site Visit Started'),
    ('operations_review', 'Operations Review'),
    ('coordinator_costing_review', 'Coordinator Costing Review'),
    ('hr_validation', 'HR Validation'),
    ('commercial_review', 'Commercial Review'),
    ('finance_review', 'Finance Review'),
    ('returned_to_bd', 'Returned to BD'),
    ('proposal_sent', 'Proposal Sent')
) as expected(stage_code, stage_name)
left join public.workflow_stages ws
  on ws.stage_code = expected.stage_code
order by coalesce(ws.stage_order, 999);

-- 3. Confirm expected constraints/indexes exist
select
  expected.index_name,
  case when i.indexname is null then 'Missing' else 'Exists' end as status
from (
  values
    ('ux_site_visits_lead_id'),
    ('ux_lead_mom_lead_id'),
    ('ux_site_assessments_site_visit_id'),
    ('ux_workflow_instances_site_visit'),
    ('ux_workflow_assignments_one_pending_stage'),
    ('ux_approval_decisions_idempotency'),
    ('ux_idempotency_keys_scope_key'),
    ('ux_assessment_locks_one_active'),
    ('ux_assessment_drafts_one_active_per_user'),
    ('ux_lead_contacts_primary_per_lead'),
    ('ux_lead_contacts_primary_per_assessment'),
    ('ux_lead_contacts_email_per_lead_normalized'),
    ('ux_lead_contacts_phone_per_lead_normalized')
) as expected(index_name)
left join pg_indexes i
  on i.schemaname = 'public'
 and i.indexname = expected.index_name
order by expected.index_name;

-- 4. Check for duplicate active pending assignments
select
  'duplicate_active_pending_assignments' as check_name,
  workflow_instance_id,
  stage_code,
  count(*) as pending_count,
  array_agg(id order by created_at) as assignment_ids
from public.workflow_assignments
where status = 'Pending'
group by workflow_instance_id, stage_code
having count(*) > 1;

-- 5. Confirm existing old tables still exist
select
  expected.table_name,
  case when c.table_name is null then 'Missing' else 'Exists' end as status
from (
  values
    ('leads'),
    ('lead_contacts'),
    ('lead_mom'),
    ('site_visits'),
    ('site_assessments'),
    ('site_mom'),
    ('approval_requests'),
    ('activity_logs'),
    ('assessment_audit_logs')
) as expected(table_name)
left join information_schema.tables c
  on c.table_schema = 'public'
 and c.table_name = expected.table_name
order by expected.table_name;

-- 6. Basic row counts after migration
select 'workflow_stages_count' as check_name, count(*) as total_count from public.workflow_stages
union all
select 'workflow_instances_count' as check_name, count(*) as total_count from public.workflow_instances
union all
select 'workflow_assignments_count' as check_name, count(*) as total_count from public.workflow_assignments
union all
select 'notifications_count' as check_name, count(*) as total_count from public.notifications
union all
select 'proposals_count' as check_name, count(*) as total_count from public.proposals;

