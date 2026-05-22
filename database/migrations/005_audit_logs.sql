-- Migration 005: Audit Logs
-- Purpose: Centralized audit trail for workflow, assessment edits, approvals, proposal events, logins, and data changes.
-- Safe to run before later workflow event and assessment section migrations.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action_type text not null,
  action_summary text,
  actor_id uuid,
  actor_name text,
  actor_role text,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  user_agent text,
  status text not null default 'Recorded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_activity_logs (
  id uuid primary key default gen_random_uuid(),
  workflow_instance_id uuid,
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete set null,
  assessment_id uuid references public.site_assessments(id) on delete set null,
  activity_type text not null,
  activity_title text not null,
  activity_message text,
  stage_code text,
  pending_with text,
  status text not null default 'Recorded',
  actor_id uuid,
  actor_name text,
  actor_role text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_edit_logs (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  section_code text,
  section_name text not null,
  action_type text not null,
  edited_by uuid,
  edited_by_name text,
  edited_by_role text,
  old_value jsonb,
  new_value jsonb not null default '{}'::jsonb,
  remarks text,
  status text not null default 'Recorded',
  metadata jsonb not null default '{}'::jsonb,
  edited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  profile_id uuid references public.profiles(id) on delete set null,
  email text,
  login_status text not null default 'Success',
  auth_provider text not null default 'Supabase',
  failure_reason text,
  ip_address inet,
  user_agent text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_change_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  operation text not null,
  changed_by uuid,
  changed_by_name text,
  changed_by_role text,
  old_row jsonb,
  new_row jsonb,
  changed_columns text[] not null default '{}'::text[],
  source text not null default 'Application',
  metadata jsonb not null default '{}'::jsonb,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id, created_at desc);
create index if not exists idx_workflow_activity_logs_workflow on public.workflow_activity_logs(workflow_instance_id, created_at desc);
create index if not exists idx_workflow_activity_logs_site_visit on public.workflow_activity_logs(site_visit_id, created_at desc);
create index if not exists idx_assessment_edit_logs_site_visit on public.assessment_edit_logs(site_visit_id, edited_at desc);
create index if not exists idx_assessment_edit_logs_section on public.assessment_edit_logs(assessment_id, section_code, edited_at desc);
create index if not exists idx_login_logs_user on public.login_logs(user_id, logged_at desc);
create index if not exists idx_login_logs_email on public.login_logs(lower(email), logged_at desc);
create index if not exists idx_data_change_logs_table_record on public.data_change_logs(table_name, record_id, changed_at desc);
create index if not exists idx_data_change_logs_changed_by on public.data_change_logs(changed_by, changed_at desc);

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'audit_logs',
    'workflow_activity_logs',
    'assessment_edit_logs',
    'login_logs',
    'data_change_logs'
  ]
  loop
    if not exists (
      select 1 from pg_trigger where tgname = 'set_updated_at_' || v_table
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
        'set_updated_at_' || v_table,
        v_table
      );
    end if;
  end loop;
end $$;
