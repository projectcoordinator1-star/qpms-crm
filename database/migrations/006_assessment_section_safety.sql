-- Migration 006: Assessment Section Safety Tables
-- Purpose: Add section-level draft, lock, and version tables to prevent whole-assessment overwrites.
-- Apply manually after reviewing against the live Supabase schema.

create extension if not exists "pgcrypto";

create table if not exists public.assessment_sections (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  section_code text not null,
  section_name text not null,
  section_data jsonb not null default '{}'::jsonb,
  status text not null default 'Draft'
    check (status in ('Draft', 'Saved', 'Locked', 'Submitted', 'Rework Requested')),
  version_number integer not null default 1,
  last_saved_by uuid,
  last_saved_by_name text,
  last_saved_by_role text,
  last_saved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_visit_id, section_code)
);

create table if not exists public.assessment_section_versions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.assessment_sections(id) on delete cascade,
  site_visit_id uuid not null references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  section_code text not null,
  version_number integer not null,
  action_type text not null
    check (action_type in ('Section Saved', 'Section Edited', 'Section Resaved', 'Autosaved', 'Submitted for Review')),
  old_value jsonb,
  new_value jsonb not null default '{}'::jsonb,
  edited_by uuid,
  edited_by_name text,
  edited_by_role text,
  remarks text,
  created_at timestamptz not null default now(),
  unique (section_id, version_number)
);

create table if not exists public.assessment_drafts (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null references public.site_visits(id) on delete cascade,
  assessment_id uuid references public.site_assessments(id) on delete cascade,
  section_code text not null,
  draft_data jsonb not null default '{}'::jsonb,
  base_version_number integer not null default 0,
  draft_status text not null default 'Active'
    check (draft_status in ('Active', 'Promoted', 'Discarded')),
  autosaved_by uuid,
  autosaved_by_name text,
  autosaved_by_role text,
  autosaved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_locks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.assessment_sections(id) on delete cascade,
  site_visit_id uuid not null references public.site_visits(id) on delete cascade,
  section_code text not null,
  locked_by uuid,
  locked_by_name text,
  locked_by_role text,
  lock_status text not null default 'Active'
    check (lock_status in ('Active', 'Released', 'Expired')),
  locked_at timestamptz not null default now(),
  expires_at timestamptz,
  released_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_assessment_sections_site_visit on public.assessment_sections(site_visit_id);
create index if not exists idx_assessment_sections_assessment on public.assessment_sections(assessment_id);
create index if not exists idx_assessment_section_versions_section on public.assessment_section_versions(section_id, version_number desc);
create index if not exists idx_assessment_drafts_lookup on public.assessment_drafts(site_visit_id, section_code, draft_status);
create index if not exists idx_assessment_locks_active on public.assessment_locks(section_id, lock_status);
