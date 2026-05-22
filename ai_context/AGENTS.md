# QPMS CRM AI Context

## Project Name
QPMS CRM

## Project Type
Enterprise Facilities Management CRM + Workflow Platform

---

# Business Domain

QPMS handles:
- Housekeeping
- Security
- MEP
- Technical Services
- Soft Services
- Hard Services
- IFM Operations
- Facility Management Contracts

The system is designed for:
- BD Teams
- Operations Teams
- HR
- Commercial
- Finance
- Coordinators
- Management
- COO
- Clients (future)

---

# Current Modules

## Module 1
- Lead Management
- Lead MOM
- Site Visit & Estimation
- Proposal Generation
- Approval Workflow

## Future Modules
- FO Mobile App
- Client Ticketing
- Operations Dashboard
- Attendance
- Escalation Matrix
- SLA Tracking
- Geofencing
- Notification Engine
- Approval Escalation
- AI Analytics
- PowerBI Style Dashboards

---

# Current Workflow

Lead
→ Lead MOM
→ Convert to Site Visit & Estimation
→ Operations Review
→ Coordinator Review
→ HR Validation
→ Commercial Review
→ Finance Review
→ Returned to BD
→ Proposal Sent to Client

---

# Key Rules

- Converted leads must disappear from Lead Management.
- Lead MOM cannot be regenerated repeatedly after conversion.
- Contact duplication must never happen.
- Assessment forms must behave like clean step-by-step forms.
- Workflow/timeline widgets should NOT clutter form pages.
- All proposals and MOM mails must be sent through the system.
- Notifications and alerts are mandatory.
- Save Draft must work reliably without data loss.

---

# Role Permissions

## BD Team
- Create Leads
- Edit Assessment
- Submit for Reviews
- Send Proposal

## Operations Team
- Fill operational assessment details
- Fill tools/equipment/consumables
- Collaborate with BD

## Coordinator
- Review assessment details
- Validate operational scope

## HR
Can edit ONLY:
- Manpower Requirement
- Wage/HR related costing
- HR feasibility

Cannot edit:
- commercial costing
- finance
- proposal

## Commercial
Can edit ONLY:
- pricing
- margin
- costing
- commercial statement

## Finance
Can edit ONLY:
- finance approvals
- budget validation
- profitability checks

---

# UI/UX Philosophy

The application should feel:
- Enterprise
- Clean
- Premium
- Modern SaaS
- PowerBI inspired
- Salesforce inspired

Avoid:
- clutter
- unnecessary helper text
- excessive widgets
- too many workflow indicators
- dashboard-heavy forms

Priority:
MAXIMUM workspace for data entry.

---

# Form UX Requirements

Site Visit & Estimation should work as:
- step-by-step workflow
- previous/next navigation
- save draft
- mandatory validation
- editable before submit

NOT as:
- dashboard
- workflow monitor
- analytics page

---

# Technical Stack

Frontend:
- React
- Vite

Backend:
- Node.js
- Express

Database:
- Supabase PostgreSQL

Hosting:
- Vercel

Future:
- AWS migration
- Mobile App
- Push Notifications

---

# AI Coding Expectations

Always generate:
- scalable architecture
- reusable components
- modular code
- production-ready UI
- proper validation
- proper workflow state handling

Avoid:
- mock logic
- temporary fixes
- duplicate data
- localStorage-only workflows

Database-first architecture preferred.

---

# Dashboard Philosophy

Dashboards should eventually support:
- PowerBI style charts
- KPI cards
- workflow tracking
- SLA alerts
- approval bottlenecks
- operational analytics
- client analytics

But forms themselves should stay minimal and focused.