-- Migration 002: Workflow Foundation Tables
-- Purpose: Add canonical workflow tables without removing or changing existing demo workflow tables.
-- Apply manually after reviewing against the live Supabase schema.

create extension if not exists "pgcrypto";

create table if not exists public.workflow_stages (
  id uuid primary key default gen_random_uuid(),
  stage_code text not null unique,
  stage_name text not null,
  stage_order integer not null unique,
  owner_role text,
  is_terminal boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_instances (
  id uuid primary key default gen_random_uuid(),
  workflow_code text not null default 'pre_operational_assessment',
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete set null,
  current_stage_code text references public.workflow_stages(stage_code),
  status text not null default 'Draft'
    check (status in ('Draft', 'In Progress', 'Pending Review', 'Approved', 'Rework Requested', 'Rejected', 'Completed', 'Cancelled')),
  pending_role text,
  pending_user_id uuid,
  rework_status text,
  approval_status text not null default 'Not Started',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_by uuid,
  updated_by uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_assignments (
  id uuid primary key default gen_random_uuid(),
  workflow_instance_id uuid not null references public.workflow_instances(id) on delete cascade,
  stage_code text not null references public.workflow_stages(stage_code),
  assigned_role text not null,
  assigned_user_id uuid,
  status text not null default 'Pending'
    check (status in ('Pending', 'Completed', 'Rework Requested', 'Rejected', 'Reassigned', 'Escalated', 'Cancelled')),
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  due_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  remarks text,
  created_by uuid,
  updated_by uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_transitions (
  id uuid primary key default gen_random_uuid(),
  workflow_code text not null default 'pre_operational_assessment',
  from_stage_code text references public.workflow_stages(stage_code),
  to_stage_code text not null references public.workflow_stages(stage_code),
  action_code text not null,
  allowed_role text,
  next_pending_role text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_code, from_stage_code, to_stage_code, action_code, allowed_role)
);

create table if not exists public.approval_decisions (
  id uuid primary key default gen_random_uuid(),
  workflow_instance_id uuid not null references public.workflow_instances(id) on delete cascade,
  assignment_id uuid references public.workflow_assignments(id) on delete set null,
  stage_code text not null references public.workflow_stages(stage_code),
  decision text not null check (decision in ('Approved', 'Rework Requested', 'Rejected', 'Reassigned', 'Escalated')),
  decision_by uuid,
  decision_by_name text,
  decision_by_role text,
  remarks text,
  old_status text,
  new_status text,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_events (
  id uuid primary key default gen_random_uuid(),
  workflow_instance_id uuid references public.workflow_instances(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete set null,
  assessment_id uuid references public.site_assessments(id) on delete set null,
  event_type text not null,
  event_title text not null,
  event_description text,
  stage_code text references public.workflow_stages(stage_code),
  actor_id uuid,
  actor_name text,
  actor_role text,
  old_value jsonb,
  new_value jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null,
  scope text not null,
  entity_type text,
  entity_id uuid,
  request_hash text,
  response_payload jsonb,
  status text not null default 'Completed'
    check (status in ('Started', 'Completed', 'Failed', 'Expired')),
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (scope, idempotency_key)
);

create index if not exists idx_workflow_instances_lead_id on public.workflow_instances(lead_id);
create index if not exists idx_workflow_instances_site_visit_id on public.workflow_instances(site_visit_id);
create index if not exists idx_workflow_instances_current_stage on public.workflow_instances(current_stage_code);
create index if not exists idx_workflow_assignments_instance on public.workflow_assignments(workflow_instance_id);
create index if not exists idx_workflow_assignments_pending_role on public.workflow_assignments(assigned_role, status);
create index if not exists idx_approval_decisions_instance on public.approval_decisions(workflow_instance_id);
create index if not exists idx_workflow_events_instance on public.workflow_events(workflow_instance_id, created_at desc);
