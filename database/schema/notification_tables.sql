-- QPMS CRM Notification Tables
-- Purpose: Notification, outbox, and calendar invite foundation for workflow alerts and MOM/proposal delivery tracking.
-- Source migrations:
--   database/migrations/004_notifications.sql

-- Canonical tables added in Phase 1:
--   notifications       In-app alerts for users and roles.
--   notification_logs   Delivery attempts and provider responses.
--   email_outbox        Async email queue foundation.
--   calendar_invites    ICS invite records linked to email/site visits.

-- Notification statuses:
--   Unread
--   Read
--   Archived

-- Email outbox statuses:
--   Pending
--   Sending
--   Sent
--   Failed
--   Cancelled

