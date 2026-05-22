-- QPMS CRM Pre-Migration Checks
-- Purpose: Run before Phase 1 foundation migrations to identify data that may block safe indexes.
-- Usage: Execute manually in Supabase SQL editor. This file does not modify data.

-- 1. Duplicate site_visits.lead_id
select
  'duplicate_site_visits_lead_id' as check_name,
  lead_id,
  count(*) as duplicate_count,
  array_agg(id order by created_at nulls last) as site_visit_ids
from public.site_visits
where lead_id is not null
group by lead_id
having count(*) > 1;

-- 2. Duplicate lead_mom.lead_id
select
  'duplicate_lead_mom_lead_id' as check_name,
  lead_id,
  count(*) as duplicate_count,
  array_agg(id order by created_at nulls last) as lead_mom_ids
from public.lead_mom
where lead_id is not null
group by lead_id
having count(*) > 1;

-- 3. Duplicate site_assessments.site_visit_id
select
  'duplicate_site_assessments_site_visit_id' as check_name,
  site_visit_id,
  count(*) as duplicate_count,
  array_agg(id order by created_at nulls last) as assessment_ids
from public.site_assessments
where site_visit_id is not null
group by site_visit_id
having count(*) > 1;

-- 4. Duplicate primary contacts per lead
select
  'duplicate_primary_contacts_per_lead' as check_name,
  lead_id,
  count(*) as primary_contact_count,
  array_agg(id order by created_at nulls last) as contact_ids
from public.lead_contacts
where is_primary = true
  and lead_id is not null
  and assessment_id is null
group by lead_id
having count(*) > 1;

-- 5. Duplicate primary contacts per assessment
select
  'duplicate_primary_contacts_per_assessment' as check_name,
  assessment_id,
  count(*) as primary_contact_count,
  array_agg(id order by created_at nulls last) as contact_ids
from public.lead_contacts
where is_primary = true
  and assessment_id is not null
group by assessment_id
having count(*) > 1;

-- 6. Orphan site_visits without a valid lead
select
  'orphan_site_visits_without_lead' as check_name,
  sv.id as site_visit_id,
  sv.lead_id,
  sv.client_name,
  sv.created_at
from public.site_visits sv
left join public.leads l on l.id = sv.lead_id
where sv.lead_id is not null
  and l.id is null;

-- 7. Orphan assessments without a valid site_visit
select
  'orphan_assessments_without_site_visit' as check_name,
  sa.id as assessment_id,
  sa.site_visit_id,
  sa.created_at,
  sa.updated_at
from public.site_assessments sa
left join public.site_visits sv on sv.id = sa.site_visit_id
where sa.site_visit_id is not null
  and sv.id is null;

-- 8. Existing approval_requests count
select
  'approval_requests_count' as check_name,
  count(*) as total_count,
  count(*) filter (where status = 'Pending') as pending_count,
  count(*) filter (where status = 'Approved') as approved_count,
  count(*) filter (where status = 'Rework Requested') as rework_requested_count,
  count(*) filter (where status = 'Rejected') as rejected_count
from public.approval_requests;

-- 9. Existing lead/site visit/assessment counts
select 'leads_count' as check_name, count(*) as total_count from public.leads
union all
select 'site_visits_count' as check_name, count(*) as total_count from public.site_visits
union all
select 'site_assessments_count' as check_name, count(*) as total_count from public.site_assessments
union all
select 'lead_contacts_count' as check_name, count(*) as total_count from public.lead_contacts
union all
select 'lead_mom_count' as check_name, count(*) as total_count from public.lead_mom;

