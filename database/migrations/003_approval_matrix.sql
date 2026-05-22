-- Migration 003: Approval Matrix
-- Purpose: Role-aware approval routing for Operations, Coordinator, HR, Commercial, Finance, BD, and Management.
-- Safe to run after 001_initial_schema and before workflow RPC migrations.

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

create table if not exists public.approval_matrix (
  id uuid primary key default gen_random_uuid(),
  matrix_code text not null unique,
  matrix_name text not null,
  workflow_code text not null default 'pre_operational_assessment',
  description text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_matrix_rules (
  id uuid primary key default gen_random_uuid(),
  matrix_id uuid not null references public.approval_matrix(id) on delete cascade,
  stage_code text not null,
  stage_name text not null,
  stage_order integer not null,
  reviewer_role text not null,
  reviewer_user_id uuid,
  action_type text not null default 'Review',
  next_stage_code text,
  rework_stage_code text,
  reject_stage_code text,
  sla_hours integer,
  escalation_role text,
  is_required boolean not null default true,
  is_active boolean not null default true,
  conditions jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (matrix_id, stage_code)
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  approval_stage text not null,
  pending_with text not null,
  status text not null default 'Pending',
  remarks text,
  approved_by text,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_comments (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid references public.approval_requests(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  stage_code text,
  comment_type text not null default 'Comment',
  comment_text text not null,
  commented_by uuid,
  commented_by_name text,
  commented_by_role text,
  visibility text not null default 'Internal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_escalations (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid references public.approval_requests(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  stage_code text not null,
  escalated_from_role text,
  escalated_to_role text not null,
  escalated_to_user_id uuid,
  escalation_reason text,
  status text not null default 'Open',
  escalated_by uuid,
  escalated_by_name text,
  escalated_at timestamptz not null default now(),
  resolved_by uuid,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviewer_assignments (
  id uuid primary key default gen_random_uuid(),
  matrix_rule_id uuid references public.approval_matrix_rules(id) on delete cascade,
  approval_request_id uuid references public.approval_requests(id) on delete cascade,
  workflow_instance_id uuid,
  lead_id uuid references public.leads(id) on delete cascade,
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  stage_code text not null,
  reviewer_role text not null,
  reviewer_user_id uuid,
  reviewer_name text,
  assignment_status text not null default 'Pending',
  priority text not null default 'Medium',
  due_at timestamptz,
  assigned_by uuid,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  remarks text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.approval_matrix (matrix_code, matrix_name, description)
values (
  'pre_operational_assessment',
  'Pre-Operational Assessment Approval Matrix',
  'Default QPMS CRM approval route from Operations through Proposal Sent.'
)
on conflict (matrix_code) do update set
  matrix_name = excluded.matrix_name,
  description = excluded.description,
  updated_at = now();

insert into public.approval_matrix_rules (
  matrix_id,
  stage_code,
  stage_name,
  stage_order,
  reviewer_role,
  next_stage_code,
  rework_stage_code,
  reject_stage_code,
  sla_hours,
  escalation_role
)
select
  am.id,
  rules.stage_code,
  rules.stage_name,
  rules.stage_order,
  rules.reviewer_role,
  rules.next_stage_code,
  rules.rework_stage_code,
  rules.reject_stage_code,
  rules.sla_hours,
  rules.escalation_role
from public.approval_matrix am
cross join (
  values
    ('operations_review', 'Operations Review', 30, 'Operations', 'coordinator_costing_review', 'returned_to_bd', 'rejected', 24, 'Management'),
    ('coordinator_costing_review', 'Coordinator Costing Review', 40, 'Coordinator', 'hr_validation', 'returned_to_bd', 'rejected', 24, 'Management'),
    ('hr_validation', 'HR Validation', 50, 'HR', 'commercial_review', 'returned_to_bd', 'rejected', 24, 'Management'),
    ('commercial_review', 'Commercial Review', 60, 'Commercial', 'finance_review', 'returned_to_bd', 'rejected', 24, 'Management'),
    ('finance_review', 'Finance Review', 70, 'Finance', 'returned_to_bd', 'returned_to_bd', 'rejected', 24, 'Management')
) as rules(stage_code, stage_name, stage_order, reviewer_role, next_stage_code, rework_stage_code, reject_stage_code, sla_hours, escalation_role)
where am.matrix_code = 'pre_operational_assessment'
on conflict (matrix_id, stage_code) do update set
  stage_name = excluded.stage_name,
  stage_order = excluded.stage_order,
  reviewer_role = excluded.reviewer_role,
  next_stage_code = excluded.next_stage_code,
  rework_stage_code = excluded.rework_stage_code,
  reject_stage_code = excluded.reject_stage_code,
  sla_hours = excluded.sla_hours,
  escalation_role = excluded.escalation_role,
  updated_at = now();

create index if not exists idx_approval_matrix_active on public.approval_matrix(workflow_code, is_active);
create index if not exists idx_approval_matrix_rules_matrix_order on public.approval_matrix_rules(matrix_id, stage_order);
create index if not exists idx_approval_matrix_rules_role on public.approval_matrix_rules(reviewer_role, is_active);
create index if not exists idx_approval_requests_stage_status on public.approval_requests(approval_stage, status);
create index if not exists idx_approval_requests_site_visit on public.approval_requests(site_visit_id, approval_stage, status);
create index if not exists idx_approval_comments_request on public.approval_comments(approval_request_id, created_at desc);
create index if not exists idx_approval_comments_site_visit on public.approval_comments(site_visit_id, created_at desc);
create index if not exists idx_approval_escalations_status on public.approval_escalations(status, escalated_at desc);
create index if not exists idx_reviewer_assignments_reviewer on public.reviewer_assignments(reviewer_role, reviewer_user_id, assignment_status);
create index if not exists idx_reviewer_assignments_site_visit on public.reviewer_assignments(site_visit_id, stage_code, assignment_status);

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'approval_matrix',
    'approval_matrix_rules',
    'approval_requests',
    'approval_comments',
    'approval_escalations',
    'reviewer_assignments'
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
