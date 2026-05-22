-- QPMS CRM Workflow Stages Seed
-- Purpose: Seed canonical stages for the Pre-Operational Assessment workflow.
-- Apply after workflow_stages exists. Safe to re-run.

insert into public.workflow_stages (
  stage_code,
  stage_name,
  stage_order,
  owner_role,
  is_terminal,
  is_active,
  metadata
) values
  ('lead_mom', 'Lead MOM', 10, 'BD Team', false, true, '{"description":"Lead Minutes of Meeting created before site visit conversion"}'::jsonb),
  ('site_visit_started', 'Site Visit Started', 20, 'BD Team', false, true, '{"description":"Lead converted into Site Visit & Estimation"}'::jsonb),
  ('operations_review', 'Operations Review', 30, 'Operations Team', false, true, '{"description":"Operations validates execution feasibility and operational scope"}'::jsonb),
  ('coordinator_costing_review', 'Coordinator Costing Review', 40, 'Coordinator', false, true, '{"description":"Coordinator consolidates costing readiness and reliever/zone logic"}'::jsonb),
  ('hr_validation', 'HR Validation', 50, 'HR Reviewer', false, true, '{"description":"HR validates manpower, wage, reliever, shift, and uniform costing"}'::jsonb),
  ('commercial_review', 'Commercial Review', 60, 'Commercial Reviewer', false, true, '{"description":"Commercial validates pricing, margins, and commercial statement"}'::jsonb),
  ('finance_review', 'Finance Review', 70, 'Finance Reviewer', false, true, '{"description":"Finance validates payment terms, budget feasibility, and profitability"}'::jsonb),
  ('returned_to_bd', 'Returned to BD', 80, 'BD Team', false, true, '{"description":"Approved assessment returned to BD for proposal generation"}'::jsonb),
  ('proposal_sent', 'Proposal Sent', 90, 'BD Team', true, true, '{"description":"Proposal sent to client"}'::jsonb)
on conflict (stage_code) do update set
  stage_name = excluded.stage_name,
  stage_order = excluded.stage_order,
  owner_role = excluded.owner_role,
  is_terminal = excluded.is_terminal,
  is_active = excluded.is_active,
  metadata = excluded.metadata,
  updated_at = now();
