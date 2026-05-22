-- Migration 007: Proposal Foundation Tables
-- Purpose: Add proposal header, version, line-item, and send-log persistence.
-- Apply manually after reviewing against the live Supabase schema.

create extension if not exists "pgcrypto";

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  workflow_instance_id uuid references public.workflow_instances(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete set null,
  proposal_number text unique,
  client_name text,
  proposal_status text not null default 'Draft'
    check (proposal_status in ('Draft', 'Generated', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Cancelled')),
  current_version integer not null default 1,
  proposal_value numeric(14,2) not null default 0,
  management_fee_percent numeric(8,4),
  margin_percent numeric(8,4),
  generated_by uuid,
  generated_by_name text,
  generated_at timestamptz,
  sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  version_number integer not null,
  source_template_name text,
  excel_file_url text,
  pdf_file_url text,
  generated_payload jsonb not null default '{}'::jsonb,
  generated_by uuid,
  generated_by_name text,
  generated_at timestamptz not null default now(),
  remarks text,
  unique (proposal_id, version_number)
);

create table if not exists public.proposal_line_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  proposal_version_id uuid references public.proposal_versions(id) on delete cascade,
  line_order integer not null default 0,
  designation text,
  service_scope text,
  quantity numeric(12,2) not null default 0,
  shift_type text,
  rate_per_head numeric(14,2) not null default 0,
  monthly_total numeric(14,2) not null default 0,
  management_fee numeric(14,2) not null default 0,
  contract_value numeric(14,2) not null default 0,
  costing_snapshot jsonb not null default '{}'::jsonb,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_send_logs (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  proposal_version_id uuid references public.proposal_versions(id) on delete set null,
  email_outbox_id uuid references public.email_outbox(id) on delete set null,
  sent_to text[] not null default '{}'::text[],
  sent_cc text[] not null default '{}'::text[],
  subject text,
  send_status text not null default 'Pending'
    check (send_status in ('Pending', 'Sent', 'Failed', 'Cancelled')),
  sent_by uuid,
  sent_by_name text,
  sent_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_proposals_workflow_instance on public.proposals(workflow_instance_id);
create index if not exists idx_proposals_lead on public.proposals(lead_id);
create index if not exists idx_proposal_versions_proposal on public.proposal_versions(proposal_id, version_number desc);
create index if not exists idx_proposal_line_items_proposal on public.proposal_line_items(proposal_id, line_order);
create index if not exists idx_proposal_send_logs_proposal on public.proposal_send_logs(proposal_id, created_at desc);
