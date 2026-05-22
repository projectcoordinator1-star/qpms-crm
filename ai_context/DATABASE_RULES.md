# DATABASE RULES

# Database

Primary Database:
Supabase PostgreSQL

Architecture:
Database-first enterprise architecture.

---

# Core Principles

- Avoid local-only storage
- Avoid mock workflows
- Maintain relational integrity
- Maintain workflow traceability
- Maintain audit logs

---

# Required Core Tables

## Lead Management
- leads
- lead_contacts
- lead_mom

## Assessment
- site_assessments
- assessment_sections
- assessment_drafts

## Manpower
- manpower_requirements
- manpower_costing

## Approval System
- approval_workflows
- approval_logs
- review_comments

## Proposal
- proposals
- proposal_versions

## Notifications
- notifications
- notification_logs

## Users & Roles
- users
- user_roles
- permissions

---

# UUID Rules

All major records should use:
- UUID primary keys

Avoid:
- integer-only architecture

---

# Relationship Rules

Every workflow record must maintain:
- created_by
- updated_by
- assigned_to
- current_stage
- approval_status

---

# Audit Rules

All critical actions must log:
- user
- timestamp
- action
- previous state
- new state

---

# Data Persistence Rules

Save Draft must:
- persist all sections
- restore properly
- never lose data

---

# Duplicate Prevention Rules

Must prevent:
- duplicate contacts
- duplicate assessment conversion
- duplicate MOM generation
- duplicate approval creation

---

# Notification Rules

Database must support:
- real-time notifications
- approval alerts
- escalation alerts
- workflow reminders

---

# Approval Rules

Approval system must support:
- approve
- reject
- rework
- reassignment
- escalation

---

# Future Scalability Rules

Database should support:
- multi-tenant architecture
- client portals
- mobile apps
- analytics engines
- PowerBI integration
- AWS migration

---

# Security Rules

Must support:
- role-based access
- row-level security
- approval permissions
- workflow restrictions

---

# File Storage Rules

Future storage support:
- MOM PDFs
- Proposal PDFs
- Site images
- attachments
- operational documents

Preferred:
Supabase Storage / AWS S3