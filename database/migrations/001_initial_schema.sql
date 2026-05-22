-- Migration 001: Initial Schema
-- Purpose: Initial database foundation for QPMS CRM core entities.
-- Safe to run before workflow, notification, proposal, RPC, and auth foundation migrations.

create extension if not exists "pgcrypto";

-- Shared updated_at helper. Later migrations can reuse this trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role text not null default 'BD Executive',
  status text not null default 'Pending Approval',
  is_active boolean not null default false,
  approved_by uuid,
  approved_at timestamptz,
  last_login_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text unique,
  client_name text not null,
  company_name text,
  industry_type text,
  lead_source text,
  site_location text,
  state text,
  city text,
  lead_priority text,
  service_scope jsonb not null default '[]'::jsonb,
  remarks text,
  assigned_bd_executive text,
  assigned_bd_email text,
  created_by_user_id text,
  created_by_name text,
  lead_stage text not null default 'New Lead',
  status text not null default 'Active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_contacts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assessment_id uuid,
  contact_person_name text not null,
  contact_person_designation text,
  contact_number text,
  email_id text,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_mom (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  to_email text,
  cc_emails text,
  subject text,
  discussion_summary text,
  service_scope_discussion text,
  action_items text,
  next_followup_date date,
  scheduled_site_visit_date date,
  scheduled_site_visit_time time,
  site_visit_remarks text,
  calendar_invite_sent boolean not null default false,
  mom_status text not null default 'Draft',
  sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  client_name text not null,
  site_name text,
  scheduled_visit_date date,
  scheduled_visit_time time,
  assigned_bd_executive text,
  assigned_bd_email text,
  current_stage text not null default 'Pre-Operational Assessment',
  pending_with text,
  status text not null default 'Scheduled',
  mom_status text not null default 'Pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_assessments (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null unique references public.site_visits(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  basic_site_information jsonb not null default '{}'::jsonb,
  ifm_service_scope jsonb not null default '{}'::jsonb,
  hard_services jsonb not null default '{}'::jsonb,
  soft_services jsonb not null default '{}'::jsonb,
  landscaping_pest_control jsonb not null default '{}'::jsonb,
  hse_compliance jsonb not null default '[]'::jsonb,
  manpower_requirement jsonb not null default '{}'::jsonb,
  tools_equipment_consumables jsonb not null default '{}'::jsonb,
  client_kyc jsonb not null default '{}'::jsonb,
  risk_assessment jsonb not null default '{}'::jsonb,
  penalty_clauses jsonb not null default '{}'::jsonb,
  commercial_statement jsonb not null default '{}'::jsonb,
  approval_mechanism jsonb not null default '{}'::jsonb,
  final_remarks_signoff jsonb not null default '{}'::jsonb,
  assessment_status text not null default 'Draft',
  final_remarks text,
  created_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lead_contacts
  drop constraint if exists lead_contacts_assessment_id_fkey;

alter table public.lead_contacts
  add constraint lead_contacts_assessment_id_fkey
  foreign key (assessment_id) references public.site_assessments(id) on delete cascade not valid;

create table if not exists public.site_mom (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null unique references public.site_visits(id) on delete cascade,
  to_email text,
  cc_emails text,
  subject text,
  summary text,
  scope text,
  requirements text,
  commercial_notes text,
  next_action text,
  mom_status text not null default 'Draft',
  sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete set null,
  assessment_id uuid references public.site_assessments(id) on delete set null,
  activity_type text not null,
  activity_message text,
  created_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  section_name text not null,
  action_type text not null,
  edited_by text,
  edited_by_role text,
  edited_at timestamptz not null default now(),
  old_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  remarks text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_images (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  image_category text not null,
  image_url text not null,
  file_name text,
  uploaded_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_email on public.profiles(lower(email));
create index if not exists idx_leads_status_stage on public.leads(status, lead_stage);
create index if not exists idx_leads_assigned_bd_email on public.leads(assigned_bd_email);
create index if not exists idx_lead_contacts_lead_id on public.lead_contacts(lead_id);
create index if not exists idx_lead_contacts_assessment_id on public.lead_contacts(assessment_id);
create unique index if not exists ux_lead_contacts_one_primary_per_lead on public.lead_contacts(lead_id) where is_primary = true and assessment_id is null;
create unique index if not exists ux_lead_contacts_email_per_lead on public.lead_contacts(lead_id, lower(email_id)) where email_id is not null;
create unique index if not exists ux_lead_contacts_phone_per_lead on public.lead_contacts(lead_id, contact_number) where contact_number is not null;
create index if not exists idx_lead_mom_lead_id on public.lead_mom(lead_id);
create index if not exists idx_site_visits_lead_id on public.site_visits(lead_id);
create index if not exists idx_site_visits_status_stage on public.site_visits(status, current_stage);
create index if not exists idx_site_assessments_site_visit_id on public.site_assessments(site_visit_id);
create index if not exists idx_site_mom_site_visit_id on public.site_mom(site_visit_id);
create index if not exists idx_approval_requests_site_visit_stage on public.approval_requests(site_visit_id, approval_stage, status);
create index if not exists idx_activity_logs_lead_id on public.activity_logs(lead_id, created_at desc);
create index if not exists idx_activity_logs_site_visit_id on public.activity_logs(site_visit_id, created_at desc);
create index if not exists idx_assessment_audit_logs_site_visit on public.assessment_audit_logs(site_visit_id, edited_at desc);
create index if not exists idx_site_images_site_visit_id on public.site_images(site_visit_id);

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'profiles',
    'leads',
    'lead_contacts',
    'lead_mom',
    'site_visits',
    'site_assessments',
    'site_mom',
    'approval_requests',
    'activity_logs',
    'assessment_audit_logs',
    'site_images'
  ]
  loop
    if not exists (
      select 1
      from pg_trigger
      where tgname = 'set_updated_at_' || v_table
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
        'set_updated_at_' || v_table,
        v_table
      );
    end if;
  end loop;
end $$;
