-- Migration 009: Workflow RPC Functions
-- Purpose: Transactional Supabase RPC foundation for QPMS CRM workflow commands.
--
-- Scope:
--   - Add functions only.
--   - Do not remove legacy tables.
--   - Do not change frontend workflow logic.
--   - Do not tighten RLS in this phase.
--
-- Important:
--   PostgreSQL functions execute inside the caller transaction. Unhandled exceptions roll back
--   the function's writes. These functions use row locks, uniqueness checks, and idempotency
--   records to reduce duplicate conversion, duplicate assignments, and stale assessment saves.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Canonical workflow event logger
-- ---------------------------------------------------------------------------
create or replace function public.rpc_log_workflow_event(
  p_workflow_instance_id uuid default null,
  p_lead_id uuid default null,
  p_site_visit_id uuid default null,
  p_assessment_id uuid default null,
  p_event_type text default 'Workflow Event',
  p_event_title text default 'Workflow event',
  p_event_description text default null,
  p_stage_code text default null,
  p_actor_id uuid default null,
  p_actor_name text default null,
  p_actor_role text default null,
  p_old_value jsonb default null,
  p_new_value jsonb default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  insert into public.workflow_events (
    workflow_instance_id,
    lead_id,
    site_visit_id,
    assessment_id,
    event_type,
    event_title,
    event_description,
    stage_code,
    actor_id,
    actor_name,
    actor_role,
    old_value,
    new_value,
    metadata
  ) values (
    p_workflow_instance_id,
    p_lead_id,
    p_site_visit_id,
    p_assessment_id,
    coalesce(nullif(trim(p_event_type), ''), 'Workflow Event'),
    coalesce(nullif(trim(p_event_title), ''), 'Workflow event'),
    p_event_description,
    p_stage_code,
    p_actor_id,
    p_actor_name,
    p_actor_role,
    p_old_value,
    p_new_value,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

comment on function public.rpc_log_workflow_event is
  'Canonical workflow timeline/event logger for workflow, lead, site visit, assessment, approval, notification, and proposal actions.';

-- ---------------------------------------------------------------------------
-- 2. Notification helpers
-- ---------------------------------------------------------------------------
create or replace function public.rpc_create_notification(
  p_recipient_user_id uuid default null,
  p_recipient_role text default null,
  p_workflow_instance_id uuid default null,
  p_lead_id uuid default null,
  p_site_visit_id uuid default null,
  p_notification_type text default 'Workflow Alert',
  p_title text default 'Workflow alert',
  p_message text default null,
  p_priority text default 'Medium',
  p_action_url text default null,
  p_action_label text default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
begin
  if p_recipient_user_id is null and nullif(trim(coalesce(p_recipient_role, '')), '') is null then
    raise exception 'Notification requires recipient_user_id or recipient_role.';
  end if;

  insert into public.notifications (
    recipient_user_id,
    recipient_role,
    workflow_instance_id,
    lead_id,
    site_visit_id,
    notification_type,
    title,
    message,
    priority,
    action_url,
    action_label,
    metadata
  ) values (
    p_recipient_user_id,
    nullif(trim(coalesce(p_recipient_role, '')), ''),
    p_workflow_instance_id,
    p_lead_id,
    p_site_visit_id,
    coalesce(nullif(trim(p_notification_type), ''), 'Workflow Alert'),
    coalesce(nullif(trim(p_title), ''), 'Workflow alert'),
    p_message,
    case when p_priority in ('Low', 'Medium', 'High', 'Critical') then p_priority else 'Medium' end,
    p_action_url,
    p_action_label,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_notification_id;

  insert into public.notification_logs (
    notification_id,
    channel,
    delivery_status,
    provider,
    provider_response
  ) values (
    v_notification_id,
    'In App',
    'Sent',
    'Supabase',
    jsonb_build_object('created_by_rpc', true)
  );

  return v_notification_id;
end;
$$;

comment on function public.rpc_create_notification is
  'Creates an in-app notification and a matching notification log entry.';

create or replace function public.rpc_mark_notification_read(
  p_notification_id uuid,
  p_reader_user_id uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification public.notifications%rowtype;
begin
  update public.notifications
  set
    status = 'Read',
    read_at = coalesce(read_at, now())
  where id = p_notification_id
    and (p_reader_user_id is null or recipient_user_id = p_reader_user_id)
  returning * into v_notification;

  if v_notification.id is null then
    raise exception 'Notification % not found or not readable by provided user.', p_notification_id;
  end if;

  return jsonb_build_object(
    'notification_id', v_notification.id,
    'status', v_notification.status,
    'read_at', v_notification.read_at
  );
end;
$$;

comment on function public.rpc_mark_notification_read is
  'Marks an in-app notification as read. Optional reader_user_id scopes the update.';

-- ---------------------------------------------------------------------------
-- 3. Idempotent lead conversion
-- ---------------------------------------------------------------------------
create or replace function public.rpc_convert_lead_to_assessment(
  p_lead_id uuid,
  p_actor_user_id uuid default null,
  p_actor_name text default null,
  p_actor_role text default 'BD Team',
  p_idempotency_key text default null,
  p_scheduled_visit_date date default null,
  p_scheduled_visit_time time default null,
  p_site_name text default null,
  p_primary_contact jsonb default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_site_visit public.site_visits%rowtype;
  v_workflow public.workflow_instances%rowtype;
  v_assignment_id uuid;
  v_existing_response jsonb;
  v_contact_email text;
  v_contact_phone text;
  v_contact_name text;
  v_stage_exists boolean;
  v_response jsonb;
begin
  if p_lead_id is null then
    raise exception 'lead_id is required.';
  end if;

  if p_idempotency_key is not null then
    select response_payload
    into v_existing_response
    from public.idempotency_keys
    where scope = 'lead_conversion'
      and idempotency_key = p_idempotency_key
      and status = 'Completed';

    if v_existing_response is not null then
      return v_existing_response;
    end if;

    insert into public.idempotency_keys (
      scope,
      idempotency_key,
      entity_type,
      entity_id,
      status,
      created_by
    ) values (
      'lead_conversion',
      p_idempotency_key,
      'lead',
      p_lead_id,
      'Started',
      p_actor_user_id
    )
    on conflict (scope, idempotency_key) do nothing;
  end if;

  select *
  into v_lead
  from public.leads
  where id = p_lead_id
  for update;

  if v_lead.id is null then
    raise exception 'Lead % not found.', p_lead_id;
  end if;

  select exists (
    select 1 from public.workflow_stages where stage_code = 'site_visit_started'
  ) into v_stage_exists;

  if not v_stage_exists then
    raise exception 'workflow_stages seed is missing stage_code site_visit_started. Run database/seed/workflow_stages_seed.sql first.';
  end if;

  -- Optional primary contact insert. Existing lead_contacts are reused and never duplicated.
  if p_primary_contact is not null then
    v_contact_email := nullif(lower(trim(coalesce(p_primary_contact ->> 'email_id', p_primary_contact ->> 'email', ''))), '');
    v_contact_phone := nullif(regexp_replace(coalesce(p_primary_contact ->> 'contact_number', p_primary_contact ->> 'phone', ''), '\D', '', 'g'), '');
    v_contact_name := nullif(trim(coalesce(p_primary_contact ->> 'contact_person_name', p_primary_contact ->> 'name', '')), '');

    if v_contact_name is not null
      and not exists (
        select 1
        from public.lead_contacts lc
        where lc.lead_id = p_lead_id
          and (
            (v_contact_email is not null and lower(trim(coalesce(lc.email_id, ''))) = v_contact_email)
            or (v_contact_phone is not null and regexp_replace(coalesce(lc.contact_number, ''), '\D', '', 'g') = v_contact_phone)
          )
      )
    then
      insert into public.lead_contacts (
        lead_id,
        contact_person_name,
        contact_person_designation,
        contact_number,
        email_id,
        is_primary
      ) values (
        p_lead_id,
        v_contact_name,
        nullif(trim(coalesce(p_primary_contact ->> 'contact_person_designation', p_primary_contact ->> 'designation', '')), ''),
        nullif(trim(coalesce(p_primary_contact ->> 'contact_number', p_primary_contact ->> 'phone', '')), ''),
        nullif(trim(coalesce(p_primary_contact ->> 'email_id', p_primary_contact ->> 'email', '')), ''),
        not exists (
          select 1 from public.lead_contacts
          where lead_id = p_lead_id and is_primary = true and assessment_id is null
        )
      );
    end if;
  end if;

  -- Reuse an existing site visit for this lead. The lead row lock serializes concurrent conversion attempts.
  select *
  into v_site_visit
  from public.site_visits
  where lead_id = p_lead_id
  order by created_at asc
  limit 1;

  if v_site_visit.id is null then
    insert into public.site_visits (
      lead_id,
      client_name,
      site_name,
      scheduled_visit_date,
      scheduled_visit_time,
      assigned_bd_executive,
      assigned_bd_email,
      current_stage,
      status,
      mom_status
    ) values (
      p_lead_id,
      v_lead.client_name,
      coalesce(nullif(trim(p_site_name), ''), v_lead.site_location),
      p_scheduled_visit_date,
      p_scheduled_visit_time,
      v_lead.assigned_bd_executive,
      v_lead.assigned_bd_email,
      'Site Visit Started',
      'Scheduled',
      'Pending'
    )
    returning * into v_site_visit;
  end if;

  select *
  into v_workflow
  from public.workflow_instances
  where site_visit_id = v_site_visit.id
  limit 1;

  if v_workflow.id is null then
    insert into public.workflow_instances (
      lead_id,
      site_visit_id,
      current_stage_code,
      status,
      pending_role,
      approval_status,
      created_by,
      updated_by,
      metadata
    ) values (
      p_lead_id,
      v_site_visit.id,
      'site_visit_started',
      'In Progress',
      'BD Team',
      'Not Started',
      p_actor_user_id,
      p_actor_user_id,
      coalesce(p_metadata, '{}'::jsonb)
    )
    returning * into v_workflow;
  end if;

  insert into public.workflow_assignments (
    workflow_instance_id,
    stage_code,
    assigned_role,
    assigned_user_id,
    status,
    priority,
    created_by,
    updated_by,
    remarks
  )
  select
    v_workflow.id,
    'site_visit_started',
    'BD Team',
    p_actor_user_id,
    'Pending',
    'Medium',
    p_actor_user_id,
    p_actor_user_id,
    'Initial assessment workspace created from lead conversion.'
  where not exists (
    select 1 from public.workflow_assignments
    where workflow_instance_id = v_workflow.id
      and stage_code = 'site_visit_started'
      and status = 'Pending'
  )
  returning id into v_assignment_id;

  update public.leads
  set
    lead_stage = 'Converted',
    status = 'Converted to Assessment',
    updated_at = now()
  where id = p_lead_id;

  perform public.rpc_log_workflow_event(
    v_workflow.id,
    p_lead_id,
    v_site_visit.id,
    null,
    'Lead Converted',
    'Lead moved to Site Visit & Estimation',
    'Lead conversion completed idempotently and linked to workflow instance.',
    'site_visit_started',
    p_actor_user_id,
    p_actor_name,
    p_actor_role,
    jsonb_build_object('lead_stage', v_lead.lead_stage, 'status', v_lead.status),
    jsonb_build_object('lead_stage', 'Converted', 'status', 'Converted to Assessment', 'site_visit_id', v_site_visit.id),
    coalesce(p_metadata, '{}'::jsonb)
  );

  v_response := jsonb_build_object(
    'lead_id', p_lead_id,
    'site_visit_id', v_site_visit.id,
    'workflow_instance_id', v_workflow.id,
    'assignment_id', v_assignment_id,
    'status', 'Converted to Assessment'
  );

  if p_idempotency_key is not null then
    update public.idempotency_keys
    set
      status = 'Completed',
      response_payload = v_response,
      entity_type = 'workflow_instance',
      entity_id = v_workflow.id
    where scope = 'lead_conversion'
      and idempotency_key = p_idempotency_key;
  end if;

  return v_response;
exception
  when others then
    if p_idempotency_key is not null then
      update public.idempotency_keys
      set status = 'Failed'
      where scope = 'lead_conversion'
        and idempotency_key = p_idempotency_key;
    end if;
    raise;
end;
$$;

comment on function public.rpc_convert_lead_to_assessment is
  'Idempotently converts a lead into Site Visit & Estimation, reusing existing site visits and contacts, creating workflow instance and initial assignment.';

-- ---------------------------------------------------------------------------
-- 4. Section-level assessment save and draft save
-- ---------------------------------------------------------------------------
create or replace function public.rpc_save_assessment_section(
  p_site_visit_id uuid,
  p_section_code text,
  p_section_name text default null,
  p_section_data jsonb default '{}'::jsonb,
  p_base_version_number integer default null,
  p_save_mode text default 'save',
  p_actor_user_id uuid default null,
  p_actor_name text default null,
  p_actor_role text default null,
  p_remarks text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site_visit public.site_visits%rowtype;
  v_assessment public.site_assessments%rowtype;
  v_section public.assessment_sections%rowtype;
  v_section_code text;
  v_section_name text;
  v_new_version integer;
  v_draft_id uuid;
  v_old_section_data jsonb;
begin
  if p_site_visit_id is null then
    raise exception 'site_visit_id is required.';
  end if;

  v_section_code := nullif(trim(coalesce(p_section_code, '')), '');
  if v_section_code is null then
    raise exception 'section_code is required.';
  end if;

  v_section_name := coalesce(nullif(trim(p_section_name), ''), initcap(replace(v_section_code, '_', ' ')));

  select *
  into v_site_visit
  from public.site_visits
  where id = p_site_visit_id
  for update;

  if v_site_visit.id is null then
    raise exception 'Site visit % not found.', p_site_visit_id;
  end if;

  select *
  into v_assessment
  from public.site_assessments
  where site_visit_id = p_site_visit_id
  for update;

  if v_assessment.id is null then
    insert into public.site_assessments (
      site_visit_id,
      lead_id,
      assessment_status,
      created_by
    ) values (
      p_site_visit_id,
      v_site_visit.lead_id,
      'Draft',
      p_actor_name
    )
    returning * into v_assessment;
  end if;

  if lower(coalesce(p_save_mode, 'save')) = 'draft' then
    if p_actor_user_id is not null then
      update public.assessment_drafts
      set
        draft_data = coalesce(p_section_data, '{}'::jsonb),
        base_version_number = coalesce(p_base_version_number, base_version_number, 0),
        autosaved_by_name = p_actor_name,
        autosaved_by_role = p_actor_role,
        autosaved_at = now(),
        updated_at = now()
      where site_visit_id = p_site_visit_id
        and section_code = v_section_code
        and autosaved_by = p_actor_user_id
        and draft_status = 'Active'
      returning id into v_draft_id;
    end if;

    if v_draft_id is null then
      insert into public.assessment_drafts (
        site_visit_id,
        assessment_id,
        section_code,
        draft_data,
        base_version_number,
        autosaved_by,
        autosaved_by_name,
        autosaved_by_role
      ) values (
        p_site_visit_id,
        v_assessment.id,
        v_section_code,
        coalesce(p_section_data, '{}'::jsonb),
        coalesce(p_base_version_number, 0),
        p_actor_user_id,
        p_actor_name,
        p_actor_role
      )
      returning id into v_draft_id;
    end if;

    return jsonb_build_object(
      'mode', 'draft',
      'draft_id', v_draft_id,
      'site_visit_id', p_site_visit_id,
      'assessment_id', v_assessment.id,
      'section_code', v_section_code
    );
  end if;

  select *
  into v_section
  from public.assessment_sections
  where site_visit_id = p_site_visit_id
    and section_code = v_section_code
  for update;

  if v_section.id is null then
    insert into public.assessment_sections (
      site_visit_id,
      assessment_id,
      section_code,
      section_name,
      section_data,
      status,
      version_number,
      last_saved_by,
      last_saved_by_name,
      last_saved_by_role,
      last_saved_at
    ) values (
      p_site_visit_id,
      v_assessment.id,
      v_section_code,
      v_section_name,
      coalesce(p_section_data, '{}'::jsonb),
      'Saved',
      1,
      p_actor_user_id,
      p_actor_name,
      p_actor_role,
      now()
    )
    returning * into v_section;

    insert into public.assessment_section_versions (
      section_id,
      site_visit_id,
      assessment_id,
      section_code,
      version_number,
      action_type,
      old_value,
      new_value,
      edited_by,
      edited_by_name,
      edited_by_role,
      remarks
    ) values (
      v_section.id,
      p_site_visit_id,
      v_assessment.id,
      v_section_code,
      1,
      'Section Saved',
      null,
      coalesce(p_section_data, '{}'::jsonb),
      p_actor_user_id,
      p_actor_name,
      p_actor_role,
      p_remarks
    );
  else
    if p_base_version_number is not null and p_base_version_number <> v_section.version_number then
      raise exception 'Stale section save blocked. Current version is %, submitted base version is %.',
        v_section.version_number, p_base_version_number
        using errcode = '40001';
    end if;

    v_new_version := v_section.version_number + 1;
    v_old_section_data := v_section.section_data;

    update public.assessment_sections
    set
      section_name = v_section_name,
      section_data = coalesce(p_section_data, '{}'::jsonb),
      status = 'Saved',
      version_number = v_new_version,
      last_saved_by = p_actor_user_id,
      last_saved_by_name = p_actor_name,
      last_saved_by_role = p_actor_role,
      last_saved_at = now(),
      updated_at = now()
    where id = v_section.id
    returning * into v_section;

    insert into public.assessment_section_versions (
      section_id,
      site_visit_id,
      assessment_id,
      section_code,
      version_number,
      action_type,
      old_value,
      new_value,
      edited_by,
      edited_by_name,
      edited_by_role,
      remarks
    ) values (
      v_section.id,
      p_site_visit_id,
      v_assessment.id,
      v_section_code,
      v_new_version,
      'Section Resaved',
      v_old_section_data,
      coalesce(p_section_data, '{}'::jsonb),
      p_actor_user_id,
      p_actor_name,
      p_actor_role,
      p_remarks
    );
  end if;

  update public.assessment_drafts
  set
    draft_status = 'Promoted',
    updated_at = now()
  where site_visit_id = p_site_visit_id
    and section_code = v_section_code
    and draft_status = 'Active'
    and (p_actor_user_id is null or autosaved_by = p_actor_user_id);

  update public.site_assessments
  set
    assessment_status = 'Draft',
    updated_at = now()
  where id = v_assessment.id;

  return jsonb_build_object(
    'mode', 'save',
    'section_id', v_section.id,
    'site_visit_id', p_site_visit_id,
    'assessment_id', v_assessment.id,
    'section_code', v_section_code,
    'version_number', v_section.version_number,
    'status', v_section.status
  );
end;
$$;

comment on function public.rpc_save_assessment_section is
  'Saves one assessment section or draft with version checks to prevent stale whole-assessment overwrites.';

-- ---------------------------------------------------------------------------
-- 5. Submit assessment/workflow for next review
-- ---------------------------------------------------------------------------
create or replace function public.rpc_submit_for_review(
  p_workflow_instance_id uuid default null,
  p_site_visit_id uuid default null,
  p_target_stage_code text default 'operations_review',
  p_actor_user_id uuid default null,
  p_actor_name text default null,
  p_actor_role text default 'BD Team',
  p_idempotency_key text default null,
  p_remarks text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workflow public.workflow_instances%rowtype;
  v_stage public.workflow_stages%rowtype;
  v_assignment_id uuid;
  v_existing_response jsonb;
  v_response jsonb;
  v_previous_stage_code text;
begin
  if p_workflow_instance_id is null and p_site_visit_id is null then
    raise exception 'workflow_instance_id or site_visit_id is required.';
  end if;

  if p_idempotency_key is not null then
    select response_payload
    into v_existing_response
    from public.idempotency_keys
    where scope = 'submit_for_review'
      and idempotency_key = p_idempotency_key
      and status = 'Completed';

    if v_existing_response is not null then
      return v_existing_response;
    end if;

    insert into public.idempotency_keys (scope, idempotency_key, entity_type, entity_id, status, created_by)
    values ('submit_for_review', p_idempotency_key, 'workflow_instance', p_workflow_instance_id, 'Started', p_actor_user_id)
    on conflict (scope, idempotency_key) do nothing;
  end if;

  select *
  into v_stage
  from public.workflow_stages
  where stage_code = p_target_stage_code
    and is_active = true;

  if v_stage.id is null then
    raise exception 'Workflow stage % not found or inactive.', p_target_stage_code;
  end if;

  select *
  into v_workflow
  from public.workflow_instances
  where (p_workflow_instance_id is not null and id = p_workflow_instance_id)
     or (p_workflow_instance_id is null and site_visit_id = p_site_visit_id)
  order by created_at asc
  limit 1
  for update;

  if v_workflow.id is null then
    raise exception 'Workflow instance not found.';
  end if;

  v_previous_stage_code := v_workflow.current_stage_code;

  update public.workflow_assignments
  set
    status = 'Completed',
    completed_at = coalesce(completed_at, now()),
    updated_by = p_actor_user_id,
    updated_at = now()
  where workflow_instance_id = v_workflow.id
    and status = 'Pending'
    and stage_code <> p_target_stage_code;

  insert into public.workflow_assignments (
    workflow_instance_id,
    stage_code,
    assigned_role,
    status,
    priority,
    remarks,
    created_by,
    updated_by
  )
  select
    v_workflow.id,
    p_target_stage_code,
    coalesce(v_stage.owner_role, 'Operations Team'),
    'Pending',
    'High',
    p_remarks,
    p_actor_user_id,
    p_actor_user_id
  where not exists (
    select 1
    from public.workflow_assignments
    where workflow_instance_id = v_workflow.id
      and stage_code = p_target_stage_code
      and status = 'Pending'
  )
  returning id into v_assignment_id;

  update public.workflow_instances
  set
    current_stage_code = p_target_stage_code,
    status = 'Pending Review',
    pending_role = coalesce(v_stage.owner_role, 'Operations Team'),
    pending_user_id = null,
    approval_status = 'Pending',
    updated_by = p_actor_user_id,
    updated_at = now()
  where id = v_workflow.id
  returning * into v_workflow;

  update public.site_visits
  set
    current_stage = v_stage.stage_name,
    status = 'Pending Review',
    updated_at = now()
  where id = v_workflow.site_visit_id;

  perform public.rpc_log_workflow_event(
    v_workflow.id,
    v_workflow.lead_id,
    v_workflow.site_visit_id,
    v_workflow.assessment_id,
    'Submitted for Review',
    'Submitted to ' || v_stage.stage_name,
    p_remarks,
    p_target_stage_code,
    p_actor_user_id,
    p_actor_name,
    p_actor_role,
    jsonb_build_object('previous_stage_code', v_previous_stage_code),
    jsonb_build_object('current_stage_code', p_target_stage_code, 'pending_role', v_stage.owner_role),
    '{}'::jsonb
  );

  perform public.rpc_create_notification(
    null,
    coalesce(v_stage.owner_role, 'Operations Team'),
    v_workflow.id,
    v_workflow.lead_id,
    v_workflow.site_visit_id,
    'Approval Pending',
    v_stage.stage_name || ' pending',
    'A site assessment is pending your review.',
    'High',
    null,
    'Open Review',
    jsonb_build_object('stage_code', p_target_stage_code)
  );

  v_response := jsonb_build_object(
    'workflow_instance_id', v_workflow.id,
    'site_visit_id', v_workflow.site_visit_id,
    'stage_code', p_target_stage_code,
    'pending_role', v_stage.owner_role,
    'assignment_id', v_assignment_id,
    'status', 'Pending Review'
  );

  if p_idempotency_key is not null then
    update public.idempotency_keys
    set
      status = 'Completed',
      response_payload = v_response,
      entity_type = 'workflow_instance',
      entity_id = v_workflow.id
    where scope = 'submit_for_review'
      and idempotency_key = p_idempotency_key;
  end if;

  return v_response;
exception
  when others then
    if p_idempotency_key is not null then
      update public.idempotency_keys
      set status = 'Failed'
      where scope = 'submit_for_review'
        and idempotency_key = p_idempotency_key;
    end if;
    raise;
end;
$$;

comment on function public.rpc_submit_for_review is
  'Moves a workflow instance into a review stage, creates one pending assignment, logs the transition, and creates a notification.';

-- ---------------------------------------------------------------------------
-- 6. Approval decision routing
-- ---------------------------------------------------------------------------
create or replace function public.rpc_record_approval_decision(
  p_workflow_instance_id uuid,
  p_assignment_id uuid default null,
  p_stage_code text default null,
  p_decision text default 'Approved',
  p_actor_user_id uuid default null,
  p_actor_name text default null,
  p_actor_role text default null,
  p_remarks text default null,
  p_reassign_to_role text default null,
  p_reassign_to_user_id uuid default null,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workflow public.workflow_instances%rowtype;
  v_assignment public.workflow_assignments%rowtype;
  v_current_stage text;
  v_next_stage text;
  v_next_role text;
  v_transition_role text;
  v_stage_owner text;
  v_stage_name text;
  v_next_assignment_id uuid;
  v_decision_id uuid;
  v_existing_response jsonb;
  v_response jsonb;
begin
  if p_workflow_instance_id is null then
    raise exception 'workflow_instance_id is required.';
  end if;

  if p_decision not in ('Approved', 'Rework Requested', 'Rejected', 'Reassigned', 'Escalated') then
    raise exception 'Unsupported approval decision: %.', p_decision;
  end if;

  if p_idempotency_key is not null then
    select response_payload
    into v_existing_response
    from public.idempotency_keys
    where scope = 'approval_decision'
      and idempotency_key = p_idempotency_key
      and status = 'Completed';

    if v_existing_response is not null then
      return v_existing_response;
    end if;

    insert into public.idempotency_keys (scope, idempotency_key, entity_type, entity_id, status, created_by)
    values ('approval_decision', p_idempotency_key, 'workflow_instance', p_workflow_instance_id, 'Started', p_actor_user_id)
    on conflict (scope, idempotency_key) do nothing;
  end if;

  select *
  into v_workflow
  from public.workflow_instances
  where id = p_workflow_instance_id
  for update;

  if v_workflow.id is null then
    raise exception 'Workflow instance % not found.', p_workflow_instance_id;
  end if;

  v_current_stage := coalesce(nullif(trim(p_stage_code), ''), v_workflow.current_stage_code);

  select *
  into v_assignment
  from public.workflow_assignments
  where workflow_instance_id = p_workflow_instance_id
    and status = 'Pending'
    and (p_assignment_id is null or id = p_assignment_id)
    and (v_current_stage is null or stage_code = v_current_stage)
  order by created_at asc
  limit 1
  for update;

  if v_assignment.id is null then
    raise exception 'No pending assignment found for workflow % and stage %.', p_workflow_instance_id, v_current_stage;
  end if;

  v_current_stage := v_assignment.stage_code;

  if p_idempotency_key is null then
    select id
    into v_decision_id
    from public.approval_decisions
    where assignment_id = v_assignment.id
      and stage_code = v_current_stage
      and decision = p_decision
    order by created_at desc
    limit 1;

    if v_decision_id is not null then
      return jsonb_build_object(
        'workflow_instance_id', p_workflow_instance_id,
        'assignment_id', v_assignment.id,
        'decision_id', v_decision_id,
        'status', 'Already Recorded'
      );
    end if;
  end if;

  update public.workflow_assignments
  set
    status = case
      when p_decision = 'Approved' then 'Completed'
      when p_decision = 'Rework Requested' then 'Rework Requested'
      when p_decision = 'Rejected' then 'Rejected'
      when p_decision = 'Reassigned' then 'Reassigned'
      when p_decision = 'Escalated' then 'Escalated'
      else status
    end,
    completed_at = now(),
    remarks = p_remarks,
    updated_by = p_actor_user_id,
    updated_at = now()
  where id = v_assignment.id;

  insert into public.approval_decisions (
    workflow_instance_id,
    assignment_id,
    stage_code,
    decision,
    decision_by,
    decision_by_name,
    decision_by_role,
    remarks,
    old_status,
    new_status,
    idempotency_key
  ) values (
    p_workflow_instance_id,
    v_assignment.id,
    v_current_stage,
    p_decision,
    p_actor_user_id,
    p_actor_name,
    p_actor_role,
    p_remarks,
    'Pending',
    p_decision,
    p_idempotency_key
  )
  on conflict do nothing
  returning id into v_decision_id;

  if v_decision_id is null then
    select id
    into v_decision_id
    from public.approval_decisions
    where idempotency_key = p_idempotency_key
    limit 1;
  end if;

  if p_decision = 'Approved' then
    select wt.to_stage_code, wt.next_pending_role
    into v_next_stage, v_transition_role
    from public.workflow_transitions wt
    where wt.workflow_code = v_workflow.workflow_code
      and wt.from_stage_code = v_current_stage
      and wt.action_code = 'approve'
      and wt.is_active = true
    order by wt.sort_order asc, wt.created_at asc
    limit 1;

    if v_next_stage is null then
      v_next_stage := case v_current_stage
        when 'lead_mom' then 'site_visit_started'
        when 'site_visit_started' then 'operations_review'
        when 'operations_review' then 'coordinator_costing_review'
        when 'coordinator_costing_review' then 'hr_validation'
        when 'hr_validation' then 'commercial_review'
        when 'commercial_review' then 'finance_review'
        when 'finance_review' then 'returned_to_bd'
        when 'returned_to_bd' then 'proposal_sent'
        else null
      end;
    end if;
  elsif p_decision = 'Rework Requested' then
    v_next_stage := 'returned_to_bd';
    v_next_role := 'BD Team';
  elsif p_decision = 'Reassigned' then
    v_next_stage := v_current_stage;
    v_next_role := coalesce(nullif(trim(p_reassign_to_role), ''), v_assignment.assigned_role);
  elsif p_decision = 'Escalated' then
    v_next_stage := v_current_stage;
    v_next_role := coalesce(nullif(trim(p_reassign_to_role), ''), 'COO');
  else
    v_next_stage := null;
    v_next_role := null;
  end if;

  if v_next_stage is not null then
    select stage_name, owner_role
    into v_stage_name, v_stage_owner
    from public.workflow_stages
    where stage_code = v_next_stage;

    v_next_role := coalesce(nullif(trim(p_reassign_to_role), ''), v_transition_role, v_stage_owner, v_next_role, 'BD Team');

    insert into public.workflow_assignments (
      workflow_instance_id,
      stage_code,
      assigned_role,
      assigned_user_id,
      status,
      priority,
      remarks,
      created_by,
      updated_by
    )
    select
      p_workflow_instance_id,
      v_next_stage,
      v_next_role,
      case when p_decision = 'Reassigned' then p_reassign_to_user_id else null end,
      'Pending',
      case when p_decision in ('Rework Requested', 'Escalated') then 'High' else 'Medium' end,
      p_remarks,
      p_actor_user_id,
      p_actor_user_id
    where not exists (
      select 1
      from public.workflow_assignments
      where workflow_instance_id = p_workflow_instance_id
        and stage_code = v_next_stage
        and status = 'Pending'
    )
    returning id into v_next_assignment_id;

    update public.workflow_instances
    set
      current_stage_code = v_next_stage,
      status = case
        when p_decision = 'Rework Requested' then 'Rework Requested'
        else 'Pending Review'
      end,
      pending_role = v_next_role,
      pending_user_id = case when p_decision = 'Reassigned' then p_reassign_to_user_id else null end,
      rework_status = case when p_decision = 'Rework Requested' then 'Open' else rework_status end,
      approval_status = case when p_decision = 'Rework Requested' then 'Rework Requested' else 'Pending' end,
      updated_by = p_actor_user_id,
      updated_at = now()
    where id = p_workflow_instance_id
    returning * into v_workflow;

    update public.site_visits
    set
      current_stage = coalesce(v_stage_name, v_next_stage),
      status = case when p_decision = 'Rework Requested' then 'Rework Requested' else 'Pending Review' end,
      updated_at = now()
    where id = v_workflow.site_visit_id;

    perform public.rpc_create_notification(
      case when p_decision = 'Reassigned' then p_reassign_to_user_id else null end,
      v_next_role,
      v_workflow.id,
      v_workflow.lead_id,
      v_workflow.site_visit_id,
      case
        when p_decision = 'Rework Requested' then 'Rework Requested'
        when p_decision = 'Escalated' then 'Workflow Escalated'
        else 'Approval Pending'
      end,
      coalesce(v_stage_name, v_next_stage) || ' pending',
      coalesce(p_remarks, 'A workflow item requires attention.'),
      case when p_decision in ('Rework Requested', 'Escalated') then 'High' else 'Medium' end,
      null,
      'Open Workflow',
      jsonb_build_object('stage_code', v_next_stage, 'decision', p_decision)
    );
  else
    update public.workflow_instances
    set
      status = 'Rejected',
      pending_role = null,
      pending_user_id = null,
      approval_status = 'Rejected',
      updated_by = p_actor_user_id,
      updated_at = now()
    where id = p_workflow_instance_id
    returning * into v_workflow;

    update public.site_visits
    set
      status = 'Rejected',
      updated_at = now()
    where id = v_workflow.site_visit_id;
  end if;

  perform public.rpc_log_workflow_event(
    v_workflow.id,
    v_workflow.lead_id,
    v_workflow.site_visit_id,
    v_workflow.assessment_id,
    'Approval Decision',
    v_current_stage || ' - ' || p_decision,
    p_remarks,
    v_current_stage,
    p_actor_user_id,
    p_actor_name,
    p_actor_role,
    jsonb_build_object('assignment_id', v_assignment.id, 'stage_code', v_current_stage),
    jsonb_build_object('decision', p_decision, 'next_stage_code', v_next_stage, 'next_assignment_id', v_next_assignment_id),
    '{}'::jsonb
  );

  v_response := jsonb_build_object(
    'workflow_instance_id', v_workflow.id,
    'decision_id', v_decision_id,
    'closed_assignment_id', v_assignment.id,
    'next_assignment_id', v_next_assignment_id,
    'decision', p_decision,
    'current_stage_code', v_workflow.current_stage_code,
    'pending_role', v_workflow.pending_role,
    'status', v_workflow.status
  );

  if p_idempotency_key is not null then
    update public.idempotency_keys
    set
      status = 'Completed',
      response_payload = v_response,
      entity_type = 'workflow_instance',
      entity_id = v_workflow.id
    where scope = 'approval_decision'
      and idempotency_key = p_idempotency_key;
  end if;

  return v_response;
exception
  when others then
    if p_idempotency_key is not null then
      update public.idempotency_keys
      set status = 'Failed'
      where scope = 'approval_decision'
        and idempotency_key = p_idempotency_key;
    end if;
    raise;
end;
$$;

comment on function public.rpc_record_approval_decision is
  'Records approve/rework/reject/reassign/escalate decisions, closes current assignment, creates next assignment, logs event, and notifies pending owner.';

-- ---------------------------------------------------------------------------
-- 7. Proposal record generation
-- ---------------------------------------------------------------------------
create or replace function public.rpc_generate_proposal_record(
  p_workflow_instance_id uuid,
  p_actor_user_id uuid default null,
  p_actor_name text default null,
  p_actor_role text default 'BD Team',
  p_proposal_number text default null,
  p_template_name text default null,
  p_payload jsonb default '{}'::jsonb,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workflow public.workflow_instances%rowtype;
  v_lead public.leads%rowtype;
  v_proposal public.proposals%rowtype;
  v_version_id uuid;
  v_version_number integer;
  v_line jsonb;
  v_line_order integer := 0;
  v_existing_response jsonb;
  v_response jsonb;
begin
  if p_workflow_instance_id is null then
    raise exception 'workflow_instance_id is required.';
  end if;

  if p_idempotency_key is not null then
    select response_payload
    into v_existing_response
    from public.idempotency_keys
    where scope = 'proposal_generation'
      and idempotency_key = p_idempotency_key
      and status = 'Completed';

    if v_existing_response is not null then
      return v_existing_response;
    end if;

    insert into public.idempotency_keys (scope, idempotency_key, entity_type, entity_id, status, created_by)
    values ('proposal_generation', p_idempotency_key, 'workflow_instance', p_workflow_instance_id, 'Started', p_actor_user_id)
    on conflict (scope, idempotency_key) do nothing;
  end if;

  select *
  into v_workflow
  from public.workflow_instances
  where id = p_workflow_instance_id
  for update;

  if v_workflow.id is null then
    raise exception 'Workflow instance % not found.', p_workflow_instance_id;
  end if;

  select *
  into v_lead
  from public.leads
  where id = v_workflow.lead_id;

  select *
  into v_proposal
  from public.proposals
  where workflow_instance_id = p_workflow_instance_id
  order by created_at asc
  limit 1
  for update;

  if v_proposal.id is null then
    insert into public.proposals (
      workflow_instance_id,
      lead_id,
      site_visit_id,
      proposal_number,
      client_name,
      proposal_status,
      current_version,
      proposal_value,
      management_fee_percent,
      margin_percent,
      generated_by,
      generated_by_name,
      generated_at,
      metadata
    ) values (
      v_workflow.id,
      v_workflow.lead_id,
      v_workflow.site_visit_id,
      coalesce(nullif(trim(p_proposal_number), ''), 'QPMS-NB-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
      v_lead.client_name,
      'Generated',
      1,
      coalesce(nullif(p_payload ->> 'proposal_value', '')::numeric, 0),
      nullif(p_payload ->> 'management_fee_percent', '')::numeric,
      nullif(p_payload ->> 'margin_percent', '')::numeric,
      p_actor_user_id,
      p_actor_name,
      now(),
      coalesce(p_payload, '{}'::jsonb)
    )
    returning * into v_proposal;
  else
    update public.proposals
    set
      proposal_status = 'Generated',
      proposal_value = coalesce(nullif(p_payload ->> 'proposal_value', '')::numeric, proposal_value),
      management_fee_percent = coalesce(nullif(p_payload ->> 'management_fee_percent', '')::numeric, management_fee_percent),
      margin_percent = coalesce(nullif(p_payload ->> 'margin_percent', '')::numeric, margin_percent),
      generated_by = p_actor_user_id,
      generated_by_name = p_actor_name,
      generated_at = now(),
      metadata = coalesce(p_payload, metadata),
      updated_at = now()
    where id = v_proposal.id
    returning * into v_proposal;
  end if;

  select coalesce(max(version_number), 0) + 1
  into v_version_number
  from public.proposal_versions
  where proposal_id = v_proposal.id;

  insert into public.proposal_versions (
    proposal_id,
    version_number,
    source_template_name,
    generated_payload,
    generated_by,
    generated_by_name,
    remarks
  ) values (
    v_proposal.id,
    v_version_number,
    p_template_name,
    coalesce(p_payload, '{}'::jsonb),
    p_actor_user_id,
    p_actor_name,
    p_payload ->> 'remarks'
  )
  returning id into v_version_id;

  if jsonb_typeof(coalesce(p_payload -> 'line_items', '[]'::jsonb)) = 'array' then
    for v_line in select value from jsonb_array_elements(coalesce(p_payload -> 'line_items', '[]'::jsonb))
    loop
      v_line_order := v_line_order + 1;

      insert into public.proposal_line_items (
        proposal_id,
        proposal_version_id,
        line_order,
        designation,
        service_scope,
        quantity,
        shift_type,
        rate_per_head,
        monthly_total,
        management_fee,
        contract_value,
        costing_snapshot,
        remarks
      ) values (
        v_proposal.id,
        v_version_id,
        v_line_order,
        v_line ->> 'designation',
        v_line ->> 'service_scope',
        coalesce(nullif(v_line ->> 'quantity', '')::numeric, 0),
        v_line ->> 'shift_type',
        coalesce(nullif(v_line ->> 'rate_per_head', '')::numeric, 0),
        coalesce(nullif(v_line ->> 'monthly_total', '')::numeric, 0),
        coalesce(nullif(v_line ->> 'management_fee', '')::numeric, 0),
        coalesce(nullif(v_line ->> 'contract_value', '')::numeric, 0),
        coalesce(v_line -> 'costing_snapshot', '{}'::jsonb),
        v_line ->> 'remarks'
      );
    end loop;
  end if;

  perform public.rpc_log_workflow_event(
    v_workflow.id,
    v_workflow.lead_id,
    v_workflow.site_visit_id,
    v_workflow.assessment_id,
    'Proposal Generated',
    'Proposal record generated',
    'Proposal header and version were created from workflow.',
    v_workflow.current_stage_code,
    p_actor_user_id,
    p_actor_name,
    p_actor_role,
    null,
    jsonb_build_object('proposal_id', v_proposal.id, 'proposal_version_id', v_version_id, 'version_number', v_version_number),
    '{}'::jsonb
  );

  v_response := jsonb_build_object(
    'workflow_instance_id', v_workflow.id,
    'proposal_id', v_proposal.id,
    'proposal_version_id', v_version_id,
    'version_number', v_version_number,
    'proposal_status', v_proposal.proposal_status,
    'proposal_number', v_proposal.proposal_number
  );

  if p_idempotency_key is not null then
    update public.idempotency_keys
    set
      status = 'Completed',
      response_payload = v_response,
      entity_type = 'proposal',
      entity_id = v_proposal.id
    where scope = 'proposal_generation'
      and idempotency_key = p_idempotency_key;
  end if;

  return v_response;
exception
  when others then
    if p_idempotency_key is not null then
      update public.idempotency_keys
      set status = 'Failed'
      where scope = 'proposal_generation'
        and idempotency_key = p_idempotency_key;
    end if;
    raise;
end;
$$;

comment on function public.rpc_generate_proposal_record is
  'Creates or updates a proposal header, adds a proposal version, optional line items, and logs proposal generation.';
