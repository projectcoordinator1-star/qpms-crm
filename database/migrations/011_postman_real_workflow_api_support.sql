-- Migration 011: Postman real workflow API support
-- Purpose: Add explicit approval queue and workflow status tables used by backend API automation.
-- Safe to run after 001_initial_schema and 003_approval_matrix.

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

create table if not exists public.workflow_status (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  site_visit_id uuid not null unique references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete set null,
  current_stage text not null default 'Site Visit Started',
  pending_with text not null default 'BD Executive',
  approval_status text not null default 'Not Submitted',
  rework_status text not null default 'None',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_queue (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid references public.approval_requests(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  site_visit_id uuid not null references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete set null,
  approval_stage text not null,
  pending_with text not null,
  status text not null default 'Pending',
  priority text not null default 'Medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_approval_queue_pending_request
  on public.approval_queue(approval_request_id)
  where status = 'Pending' and approval_request_id is not null;

create index if not exists idx_approval_queue_stage_status
  on public.approval_queue(approval_stage, status);

create index if not exists idx_approval_queue_site_visit
  on public.approval_queue(site_visit_id);

create index if not exists idx_workflow_status_current_stage
  on public.workflow_status(current_stage, approval_status);

drop trigger if exists trg_workflow_status_updated_at on public.workflow_status;
create trigger trg_workflow_status_updated_at
before update on public.workflow_status
for each row execute function public.set_updated_at();

drop trigger if exists trg_approval_queue_updated_at on public.approval_queue;
create trigger trg_approval_queue_updated_at
before update on public.approval_queue
for each row execute function public.set_updated_at();
