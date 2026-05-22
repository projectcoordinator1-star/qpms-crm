-- Migration 008: Safe Unique Constraints and Indexes
-- Purpose: Add duplicate-prevention indexes safely. This migration intentionally skips indexes when duplicates exist.
-- Review NOTICE output after applying. Resolve duplicates, then re-run this migration if any index is skipped.

-- Expected but potentially duplicate in older data:
--   site_visits.lead_id should be unique.
--   lead_mom.lead_id should be unique.
--   site_assessments.site_visit_id should be unique.

do $$
begin
  if to_regclass('public.site_visits') is not null then
    if exists (
      select 1
      from public.site_visits
      where lead_id is not null
      group by lead_id
      having count(*) > 1
    ) then
      raise notice 'Skipped ux_site_visits_lead_id: duplicate site_visits.lead_id values exist.';
    else
      create unique index if not exists ux_site_visits_lead_id
        on public.site_visits(lead_id)
        where lead_id is not null;
    end if;
  end if;

  if to_regclass('public.lead_mom') is not null then
    if exists (
      select 1
      from public.lead_mom
      where lead_id is not null
      group by lead_id
      having count(*) > 1
    ) then
      raise notice 'Skipped ux_lead_mom_lead_id: duplicate lead_mom.lead_id values exist.';
    else
      create unique index if not exists ux_lead_mom_lead_id
        on public.lead_mom(lead_id)
        where lead_id is not null;
    end if;
  end if;

  if to_regclass('public.site_assessments') is not null then
    if exists (
      select 1
      from public.site_assessments
      where site_visit_id is not null
      group by site_visit_id
      having count(*) > 1
    ) then
      raise notice 'Skipped ux_site_assessments_site_visit_id: duplicate site_assessments.site_visit_id values exist.';
    else
      create unique index if not exists ux_site_assessments_site_visit_id
        on public.site_assessments(site_visit_id)
        where site_visit_id is not null;
    end if;
  end if;
end $$;

create unique index if not exists ux_workflow_instances_site_visit
  on public.workflow_instances(site_visit_id)
  where site_visit_id is not null;

create unique index if not exists ux_workflow_assignments_one_pending_stage
  on public.workflow_assignments(workflow_instance_id, stage_code)
  where status = 'Pending';

create unique index if not exists ux_approval_decisions_idempotency
  on public.approval_decisions(idempotency_key)
  where idempotency_key is not null;

create unique index if not exists ux_idempotency_keys_scope_key
  on public.idempotency_keys(scope, idempotency_key);

create unique index if not exists ux_assessment_locks_one_active
  on public.assessment_locks(section_id)
  where lock_status = 'Active';

create unique index if not exists ux_assessment_drafts_one_active_per_user
  on public.assessment_drafts(site_visit_id, section_code, autosaved_by)
  where draft_status = 'Active' and autosaved_by is not null;

do $$
begin
  if to_regclass('public.lead_contacts') is not null then
    if exists (
      select 1
      from public.lead_contacts
      where is_primary = true and lead_id is not null and assessment_id is null
      group by lead_id
      having count(*) > 1
    ) then
      raise notice 'Skipped ux_lead_contacts_primary_per_lead: multiple primary contacts exist for at least one lead.';
    else
      create unique index if not exists ux_lead_contacts_primary_per_lead
        on public.lead_contacts(lead_id)
        where is_primary = true and lead_id is not null and assessment_id is null;
    end if;

    if exists (
      select 1
      from public.lead_contacts
      where is_primary = true and assessment_id is not null
      group by assessment_id
      having count(*) > 1
    ) then
      raise notice 'Skipped ux_lead_contacts_primary_per_assessment: multiple primary contacts exist for at least one assessment.';
    else
      create unique index if not exists ux_lead_contacts_primary_per_assessment
        on public.lead_contacts(assessment_id)
        where is_primary = true and assessment_id is not null;
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'lead_contacts'
        and column_name = 'email_id'
    ) then
      if exists (
        select 1
        from public.lead_contacts
        where lead_id is not null and email_id is not null and trim(email_id) <> ''
        group by lead_id, lower(trim(email_id))
        having count(*) > 1
      ) then
        raise notice 'Skipped ux_lead_contacts_email_per_lead_normalized: duplicate normalized contact emails exist for at least one lead.';
      else
        create unique index if not exists ux_lead_contacts_email_per_lead_normalized
          on public.lead_contacts(lead_id, lower(trim(email_id)))
          where email_id is not null and trim(email_id) <> '';
      end if;
    else
      raise notice 'Skipped ux_lead_contacts_email_per_lead_normalized: lead_contacts.email_id column does not exist.';
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'lead_contacts'
        and column_name = 'contact_number'
    ) then
      if exists (
        select 1
        from public.lead_contacts
        where lead_id is not null and contact_number is not null and regexp_replace(contact_number, '\D', '', 'g') <> ''
        group by lead_id, regexp_replace(contact_number, '\D', '', 'g')
        having count(*) > 1
      ) then
        raise notice 'Skipped ux_lead_contacts_phone_per_lead_normalized: duplicate normalized contact phones exist for at least one lead.';
      else
        create unique index if not exists ux_lead_contacts_phone_per_lead_normalized
          on public.lead_contacts(lead_id, regexp_replace(contact_number, '\D', '', 'g'))
          where contact_number is not null and regexp_replace(contact_number, '\D', '', 'g') <> '';
      end if;
    else
      raise notice 'Skipped ux_lead_contacts_phone_per_lead_normalized: lead_contacts.contact_number column does not exist.';
    end if;
  end if;
end $$;
