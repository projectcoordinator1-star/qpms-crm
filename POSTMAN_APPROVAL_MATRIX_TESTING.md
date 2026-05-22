# QPMS CRM Postman Approval Matrix Testing

This document explains how to automate the QPMS CRM approval matrix demo flow using backend APIs and Postman.

## Current API Architecture

The existing application uses two API styles:

- Mail API on the Express backend:
  - `GET /health`
  - `POST /send-lead-mom`
  - `POST /send-sitevisit-mom`
- Workflow data in the React app currently uses Supabase directly through `src/services/workflowRepository.js`:
  - `leads`
  - `lead_contacts`
  - `site_visits`
  - `site_assessments`
  - `approval_requests`
  - workflow RPC functions such as `rpc_submit_for_review` and `rpc_record_approval_decision`

Because the backend did not previously expose approval workflow APIs, a demo-safe Postman API surface has been added under `/api/*`. These endpoints are isolated from the UI and use an in-memory test store so Postman can validate approval matrix behavior without changing production Supabase data.

## Files Added

- `postman/QPMS_Approval_Matrix.postman_collection.json`
- `postman/QPMS_Approval_Matrix.postman_environment.json`
- `POSTMAN_APPROVAL_MATRIX_TESTING.md`

## Environment Variables

Import `postman/QPMS_Approval_Matrix.postman_environment.json`.

Required variables:

- `baseUrl`
- `bdToken`
- `commercialToken`
- `financeToken`
- `hrToken`
- `leadId`
- `siteVisitId`
- `approvalId`

Additional helper variables:

- `adminToken`
- `commercialApprovalId`
- `financeApprovalId`
- `hrApprovalId`
- `managementApprovalId`

For local testing:

```text
baseUrl=http://localhost:4000
```

For Render testing:

```text
baseUrl=https://qpms-crm-backend.onrender.com
```

## Demo Users

Use password `123456`.

| Role | Email |
| --- | --- |
| BD Executive | `bd1@qpms.co.in` |
| Commercial Reviewer | `commercial1@qpms.co.in` |
| Finance Reviewer | `finance1@qpms.co.in` |
| HR Reviewer | `hr1@qpms.co.in` |
| Admin | `admin@qpms.co.in` |

## Endpoints

### Health

`GET /health`

Checks whether the backend is alive.

### Reset Demo Store

`POST /api/test/reset`

Clears the in-memory Postman approval test store.

### Login

`POST /api/auth/login`

Body:

```json
{
  "email": "bd1@qpms.co.in",
  "password": "123456"
}
```

Returns:

```json
{
  "ok": true,
  "token": "...",
  "user": {
    "id": "bd-1",
    "name": "Ananya Rao",
    "email": "bd1@qpms.co.in",
    "role": "BD Executive"
  }
}
```

Postman test scripts save tokens into:

- `bdToken`
- `commercialToken`
- `financeToken`
- `hrToken`

### Create Lead

`POST /api/leads`

Auth:

```text
Authorization: Bearer {{bdToken}}
```

Body:

```json
{
  "company": "Postman IFM Demo Client",
  "primaryContact": "Demo Client Contact",
  "primaryContactEmail": "demo.client@example.com",
  "industryType": "Integrated Facility Management",
  "state": "Tamil Nadu",
  "city": "Chennai",
  "leadSource": "Postman Automation",
  "leadPriority": "High",
  "serviceScope": [
    "Soft Services Housekeeping",
    "Security Services",
    "Pest Control"
  ]
}
```

Saves:

- `leadId`

### Convert Lead to Site Visit

`POST /api/leads/{{leadId}}/site-visit`

Body:

```json
{
  "location": "Chennai Demo Site",
  "scheduledVisitDate": "2026-05-25",
  "scheduledVisitTime": "10:30"
}
```

Saves:

- `siteVisitId`

### Submit Site Visit Assessment

`POST /api/site-visits/{{siteVisitId}}/assessment`

Normal-value body:

```json
{
  "manpower": [
    {
      "designation": "Facility Supervisor",
      "quantity": 2,
      "shift": "General",
      "gender": "Any",
      "wageCategory": "Skilled"
    },
    {
      "designation": "Housekeeping Associate",
      "quantity": 12,
      "shift": "Day",
      "gender": "Any",
      "wageCategory": "Unskilled"
    }
  ],
  "serviceScope": [
    "Housekeeping",
    "Security",
    "Pest Control"
  ],
  "proposalValue": 1200000,
  "monthlyValue": 100000,
  "commercial": {
    "marginPercent": 12,
    "managementFee": 8
  },
  "finance": {
    "paymentTerms": "30 days"
  },
  "hr": {
    "minimumWageValidated": true
  }
}
```

### Submit Approval Matrix

`POST /api/site-visits/{{siteVisitId}}/submit-approval-matrix`

Creates pending approvals for:

- Commercial
- Finance
- HR

For high-value proposals with `proposalValue >= 2500000`, it also creates:

- Management / COO Approval

Postman test scripts save:

- `approvalId`
- `commercialApprovalId`
- `financeApprovalId`
- `hrApprovalId`
- `managementApprovalId`

### Approval Queue

`GET /api/approvals/queue?department=Commercial`

Auth:

```text
Authorization: Bearer {{commercialToken}}
```

Supported departments:

- `Commercial`
- `Finance`
- `HR`
- `Management`

### Submit Approval Decision

`POST /api/approvals/{{approvalId}}/decision`

Body:

```json
{
  "decision": "approve",
  "remarks": "Approved from Postman automation."
}
```

Supported decisions:

- `approve`
- `reject`
- `rework`

### Final Workflow Status

`GET /api/workflows/{{siteVisitId}}/status`

Returns:

- lead
- site visit
- approvals
- workflow status
- timeline events

## Happy Path Flow

Run the collection requests in this order:

1. `00 Reset Demo Store`
2. `01 Login BD User`
3. `02 Login Commercial Reviewer`
4. `03 Login Finance Reviewer`
5. `04 Login HR Reviewer`
6. `05 Create Dummy Lead`
7. `06 Convert Lead to Site Visit`
8. `07 Submit Site Visit Assessment`
9. `08 Submit for Approval Matrix`
10. `09 Commercial Queue`
11. `10 Approve Commercial Review`
12. `11 Finance Queue`
13. `12 Approve Finance Review`
14. `13 HR Queue`
15. `14 Approve HR Review`
16. `15 Verify Final Workflow Status`

Expected final workflow:

```json
{
  "approvalStatus": "Approved",
  "currentStage": "Returned to BD",
  "pendingWith": "BD Executive"
}
```

## Scenario Test Data

### 1. All Departments Approve

Use the happy path collection as-is.

Expected:

- Commercial: `Approved`
- Finance: `Approved`
- HR: `Approved`
- Workflow: `Returned to BD`

### 2. Commercial Rejects

After `08 Submit for Approval Matrix`, run:

`POST /api/approvals/{{commercialApprovalId}}/decision`

```json
{
  "decision": "reject",
  "remarks": "Commercial rejected due to low margin."
}
```

Expected:

- Workflow approval status: `Rejected`
- Current stage: `Commercial Review Rejected`
- Pending with: `BD Executive`

### 3. Finance Rejects

Approve Commercial first, then run:

`POST /api/approvals/{{financeApprovalId}}/decision`

```json
{
  "decision": "reject",
  "remarks": "Finance rejected due to payment risk."
}
```

Expected:

- Workflow approval status: `Rejected`
- Current stage: `Finance Review Rejected`

### 4. HR Rejects

Approve Commercial and Finance first, then run:

`POST /api/approvals/{{hrApprovalId}}/decision`

```json
{
  "decision": "reject",
  "remarks": "HR rejected due to missing wage validation."
}
```

Expected:

- Workflow approval status: `Rejected`
- Current stage: `HR Review Rejected`

### 5. Missing Manpower Data

Submit assessment with empty manpower:

```json
{
  "manpower": [],
  "serviceScope": ["Housekeeping"],
  "proposalValue": 900000,
  "monthlyValue": 75000
}
```

Then call:

`POST /api/site-visits/{{siteVisitId}}/submit-approval-matrix`

Expected:

```json
{
  "ok": false,
  "message": "Missing manpower data. Add manpower rows before submitting approval matrix."
}
```

### 6. High-Value Proposal Requiring Escalation

Submit assessment with:

```json
{
  "manpower": [
    {
      "designation": "Facility Manager",
      "quantity": 5,
      "shift": "General",
      "gender": "Any",
      "wageCategory": "Managerial"
    }
  ],
  "proposalValue": 3000000,
  "monthlyValue": 250000,
  "commercial": {
    "marginPercent": 14,
    "managementFee": 8
  }
}
```

Expected:

- Commercial approval created
- Finance approval created
- HR approval created
- Management / COO Approval created
- Final workflow remains pending until Management approval is decided

### 7. Normal-Value Proposal

Use:

```json
{
  "proposalValue": 1200000,
  "monthlyValue": 100000
}
```

Expected:

- Commercial approval created
- Finance approval created
- HR approval created
- No Management escalation approval

## Notes

- These Postman APIs are demo-safe and isolated from the UI.
- Existing MOM mail routes remain unchanged.
- Existing Supabase workflow logic remains unchanged.
- For production-grade API testing, the same endpoint contracts can later be wired to Supabase RPC functions instead of the in-memory test store.
