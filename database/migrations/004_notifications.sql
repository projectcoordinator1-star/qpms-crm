-- Migration 004: Notification and Outbox Tables
-- Purpose: Add in-app notifications, delivery logs, email outbox, and calendar invite tracking.
-- Apply manually after reviewing against the live Supabase schema.

create extension if not exists "pgcrypto";

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid,
  recipient_role text,
  workflow_instance_id uuid references public.workflow_instances(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete set null,
  notification_type text not null,
  title text not null,
  message text,
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Unread'
    check (status in ('Unread', 'Read', 'Archived')),
  action_url text,
  action_label text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  channel text not null check (channel in ('In App', 'Email', 'SMS', 'Push', 'Webhook')),
  delivery_status text not null default 'Pending'
    check (delivery_status in ('Pending', 'Sent', 'Failed', 'Skipped')),
  provider text,
  provider_message_id text,
  provider_response jsonb,
  error_message text,
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  workflow_instance_id uuid references public.workflow_instances(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete set null,
  email_type text not null,
  to_emails text[] not null default '{}'::text[],
  cc_emails text[] not null default '{}'::text[],
  bcc_emails text[] not null default '{}'::text[],
  subject text not null,
  body_html text,
  body_text text,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'Pending'
    check (status in ('Pending', 'Sending', 'Sent', 'Failed', 'Cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  error_message text,
  retry_count integer not null default 0,
  idempotency_key text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_invites (
  id uuid primary key default gen_random_uuid(),
  email_outbox_id uuid references public.email_outbox(id) on delete set null,
  workflow_instance_id uuid references public.workflow_instances(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  site_visit_id uuid references public.site_visits(id) on delete cascade,
  event_uid text not null,
  event_title text not null,
  event_description text,
  location text,
  attendee_emails text[] not null default '{}'::text[],
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  ics_content text,
  status text not null default 'Generated'
    check (status in ('Generated', 'Attached', 'Sent', 'Cancelled')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_uid)
);

create index if not exists idx_notifications_recipient on public.notifications(recipient_user_id, status, created_at desc);
create index if not exists idx_notifications_role on public.notifications(recipient_role, status, created_at desc);
create index if not exists idx_notification_logs_notification on public.notification_logs(notification_id, attempted_at desc);
create index if not exists idx_email_outbox_status on public.email_outbox(status, scheduled_at, created_at);
create unique index if not exists ux_email_outbox_idempotency
  on public.email_outbox(idempotency_key)
  where idempotency_key is not null;
create index if not exists idx_calendar_invites_site_visit on public.calendar_invites(site_visit_id);
