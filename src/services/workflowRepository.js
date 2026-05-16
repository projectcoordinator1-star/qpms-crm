import { isSupabaseConfigured, supabase } from '../lib/supabase.js';

function assertConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured');
  }
}

export function isRemoteWorkflowEnabled() {
  return isSupabaseConfigured;
}

function pick(row, keys, fallback = '') {
  const key = keys.find((item) => row[item] !== undefined && row[item] !== null);
  return key ? row[key] : fallback;
}

export function dbLeadToAppLead(row) {
  const relationContacts = row.lead_contacts || [];
  const directContact = pick(row, ['contact_person_name', 'contact', 'primary_contact_name']);
  const directContactPhone = pick(row, ['contact_number', 'phone']);
  const directContactEmail = pick(row, ['email_id', 'email']);
  const directContactDesignation = pick(row, ['contact_person_designation', 'designation']);
  const contacts = (relationContacts.length
    ? relationContacts
    : directContact || directContactPhone || directContactEmail
      ? [
          {
            id: `direct-${row.id}`,
            contact_person_name: directContact,
            contact_person_designation: directContactDesignation,
            contact_number: directContactPhone,
            email_id: directContactEmail,
            is_primary: true,
          },
        ]
      : []
  ).map((contact) => ({
    id: contact.id,
    name: contact.contact_person_name || '',
    designation: contact.contact_person_designation || '',
    phone: contact.contact_number || '',
    email: contact.email_id || '',
    isPrimary: Boolean(contact.is_primary),
  }));
  const primary = contacts.find((contact) => contact.isPrimary) || contacts[0] || {};

  return {
    id: row.id,
    leadId: row.lead_code || `LD-${String(row.id).slice(0, 5).toUpperCase()}`,
    company: pick(row, ['client_name', 'company_name', 'company', 'client']),
    industry: pick(row, ['industry_type', 'industry']),
    source: pick(row, ['lead_source', 'source']),
    location: pick(row, ['site_location', 'location', 'site_address']),
    state: row.state,
    city: row.city,
    priority: pick(row, ['lead_priority', 'priority']),
    remarks: row.remarks,
    assigned_bd_executive: row.assigned_bd_executive,
    assigned_bd_email: row.assigned_bd_email,
    created_by_user_id: row.created_by_user_id,
    created_by_name: row.created_by_name || row.assigned_bd_executive,
    executive: row.assigned_bd_executive,
    stage: pick(row, ['lead_stage', 'stage'], 'New Lead'),
    status: pick(row, ['status'], 'Active'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contacts,
    contact: primary.name || '',
    designation: primary.designation || '',
    phone: primary.phone || '',
    email: primary.email || '',
    mom: row.lead_mom?.[0] ? dbLeadMomToApp(row.lead_mom[0]) : null,
    activity: (row.activity_logs || []).map((log) => log.activity_message),
  };
}

export function appLeadToDbLead(lead) {
  return {
    client_name: lead.company,
    industry_type: lead.industry,
    lead_source: lead.source,
    site_location: lead.location,
    state: lead.state,
    city: lead.city,
    lead_priority: lead.priority,
    remarks: lead.remarks,
    assigned_bd_executive: lead.assigned_bd_executive || lead.executive,
    assigned_bd_email: lead.assigned_bd_email,
    created_by_user_id: lead.created_by_user_id,
    created_by_name: lead.created_by_name,
    lead_stage: lead.stage || 'New Lead',
    status: lead.status || 'Active',
    updated_at: new Date().toISOString(),
  };
}

export function dbSiteVisitToApp(row) {
  const lead = row.leads || {};
  const contacts = (lead.lead_contacts || []).map((contact) => ({
    id: contact.id,
    name: contact.contact_person_name || '',
    designation: contact.contact_person_designation || '',
    phone: contact.contact_number || '',
    email: contact.email_id || '',
    isPrimary: Boolean(contact.is_primary),
  }));
  const primary = contacts.find((contact) => contact.isPrimary) || contacts[0] || {};
  const assessment = row.site_assessments?.[0];

  return {
    id: row.id,
    leadId: row.lead_id,
    company: row.client_name,
    industry: lead.industry_type || '',
    contacts,
    contact: primary.name || '',
    designation: primary.designation || '',
    phone: primary.phone || '',
    email: primary.email || '',
    source: lead.lead_source || '',
    priority: lead.lead_priority || '',
    executive: row.assigned_bd_executive,
    assigned_bd_executive: row.assigned_bd_executive,
    assigned_bd_email: row.assigned_bd_email,
    created_by_user_id: lead.created_by_user_id,
    created_by_name: lead.created_by_name || row.assigned_bd_executive,
    location: lead.site_location || row.site_name,
    state: lead.state || '',
    city: lead.city || '',
    scheduledVisitDate: row.scheduled_visit_date || '',
    scheduledVisitTime: row.scheduled_visit_time || '',
    momStatus: row.mom_status,
    status: row.status,
    currentStage: row.current_stage,
    createdFrom: 'Supabase',
    survey: assessment ? dbAssessmentToSurvey(assessment) : undefined,
    assessmentId: assessment?.id,
    siteMom: row.site_mom?.[0] ? dbSiteMomToApp(row.site_mom[0]) : null,
    activity: (row.activity_logs || []).map((log) => log.activity_message),
  };
}

export function surveyToDbAssessment(survey, visit, status = 'Draft', user) {
  const monthlyBilling = Number(survey.commercial?.billingComponents?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0);

  return {
    site_visit_id: visit.id,
    lead_id: visit.leadId,
    basic_site_information: {
      site_address: survey.siteAddress,
      site_type: survey.siteType,
      operating_hours: survey.operatingHours,
      client_occupancy: survey.clientOccupancy,
      building_age: survey.buildingAge,
      takeover_complexity: survey.takeoverComplexity,
      site_survey_date: survey.siteSurveyDate,
      assessed_by: survey.assessedBy,
      site_contact_person: survey.siteContactPerson,
      contact_number: survey.contactNumber,
      contact_email: survey.contactEmail,
      total_site_area: survey.totalSiteArea,
      contract_period: survey.contractPeriod,
      margin_agreed: survey.marginAgreed,
      margin_type: survey.marginType,
      payment_terms: survey.paymentTerms,
      group_or_sister_concern_business: survey.groupOrSisterConcernBusiness,
      is_24_7_operation: survey.is247Operation,
    },
    ifm_service_scope: survey.ifmScope || {},
    hard_services: survey.hardServices || {},
    soft_services: survey.softServices || {},
    landscaping_pest_control: survey.landscaping || {},
    hse_compliance: survey.hseCompliance || [],
    manpower_requirement: {
      rows: survey.manpowerPlan || [],
      minimum_wages_type: survey.minimumWagesType,
      applicable_zone: survey.applicableZone,
      wage_computation_notes: survey.wageComputationNotes,
      reliever_cost_required: survey.relieverCostRequired,
      budgeted_take_home_feasibility: survey.budgetedTakeHomeFeasibility,
      local_workforce_availability: survey.localWorkforceAvailability,
      transportation_impact: survey.transportationImpact,
      bonus_payment_type: survey.bonusPaymentType,
      leave_with_wages_days: survey.leaveWithWagesDays,
      nfh_applicable: survey.nfhApplicable,
      travel_accommodation_provided: survey.travelAccommodationProvided,
    },
    tools_equipment_consumables: {
      equipment: survey.equipment || [],
      chemicals: survey.chemicals || [],
      tools: survey.tools || [],
      consumables: survey.consumables,
      rental_machinery: survey.rentalMachinery,
      non_billable_expenses: survey.nonBillableExpenses,
      uniforms_shoes_accessories: survey.uniformsShoesAccessories,
    },
    client_kyc: survey.clientKyc || {},
    risk_assessment: {
      rows: survey.risks || [],
      client_credit_rating: survey.clientCreditRating,
      market_assessment: survey.marketAssessment,
      good_paymaster: survey.goodPaymaster,
      existing_vendor_change_reason: survey.existingVendorChangeReason,
      mitigation_plan: survey.mitigationPlan,
      remarks: survey.riskRemarks,
    },
    penalty_clauses: survey.penaltyClauses || {},
    commercial_statement: {
      ...(survey.commercial || {}),
      estimated_monthly_billing: monthlyBilling,
      approval_rules: {
        coo_approval_required: monthlyBilling > 500000,
        cfo_approval_required: monthlyBilling > 500000,
        cmd_counter_approval_required: monthlyBilling > 2500000,
      },
    },
    approval_mechanism: {
      approvalWorkflow: survey.approvalWorkflow,
      coo_approval_required: monthlyBilling > 500000,
      cfo_approval_required: monthlyBilling > 500000,
      cmd_counter_approval_required: monthlyBilling > 2500000,
    },
    final_remarks_signoff: {
      finalRemarks: survey.finalRemarks,
      signOffName: survey.signOffName,
      project_remarks: survey.projectRemarks,
      site_survey_done_by: survey.siteSurveyDoneBy,
      signature_placeholder: survey.signaturePlaceholder,
    },
    assessment_status: status,
    final_remarks: survey.finalRemarks || '',
    created_by: user?.email || visit.assigned_bd_email || '',
    updated_at: new Date().toISOString(),
  };
}

export function dbAssessmentToSurvey(row) {
  return {
    siteAddress: row.basic_site_information?.site_address || '',
    siteType: row.basic_site_information?.site_type || '',
    operatingHours: row.basic_site_information?.operating_hours || '',
    clientOccupancy: row.basic_site_information?.client_occupancy || '',
    buildingAge: row.basic_site_information?.building_age || '',
    takeoverComplexity: row.basic_site_information?.takeover_complexity || 'Medium',
    ifmScope: row.ifm_service_scope || {},
    hardServices: row.hard_services || {},
    softServices: row.soft_services || {},
    landscaping: row.landscaping_pest_control || {},
    hseCompliance: row.hse_compliance || [],
    manpowerPlan: row.manpower_requirement?.rows || [],
    equipment: row.tools_equipment_consumables?.equipment || [],
    chemicals: row.tools_equipment_consumables?.chemicals || [],
    tools: row.tools_equipment_consumables?.tools || [],
    clientKyc: row.client_kyc || {},
    risks: row.risk_assessment?.rows || [],
    penaltyClauses: row.penalty_clauses || {},
    commercial: row.commercial_statement || {},
    approvalWorkflow: row.approval_mechanism?.approvalWorkflow || '',
    finalRemarks: row.final_remarks_signoff?.finalRemarks || row.final_remarks || '',
    signOffName: row.final_remarks_signoff?.signOffName || '',
  };
}

function appLeadMomToDb(mom, leadId, status) {
  return {
    lead_id: leadId,
    to_email: mom.to,
    cc_emails: mom.cc,
    subject: mom.subject,
    discussion_summary: mom.discussionSummary,
    service_scope_discussion: mom.serviceScopeDiscussion,
    action_items: mom.actionItems,
    next_followup_date: mom.nextFollowUpDate || null,
    scheduled_site_visit_date: mom.scheduledVisitDate || null,
    scheduled_site_visit_time: mom.scheduledVisitTime || null,
    site_visit_remarks: mom.siteVisitRemarks,
    mom_status: status,
    sent_at: status === 'Sent' ? new Date().toISOString() : null,
  };
}

function dbLeadMomToApp(row) {
  return {
    id: row.id,
    to: row.to_email,
    cc: row.cc_emails,
    subject: row.subject,
    discussionSummary: row.discussion_summary,
    serviceScopeDiscussion: row.service_scope_discussion,
    actionItems: row.action_items,
    nextFollowUpDate: row.next_followup_date || '',
    scheduledVisitDate: row.scheduled_site_visit_date || '',
    scheduledVisitTime: row.scheduled_site_visit_time || '',
    siteVisitRemarks: row.site_visit_remarks || '',
    sent: row.mom_status === 'Sent',
    sentAt: row.sent_at,
  };
}

function appSiteMomToDb(mom, siteVisitId, status) {
  return {
    site_visit_id: siteVisitId,
    to_email: mom.to,
    cc_emails: mom.cc,
    subject: mom.subject,
    summary: mom.summary,
    scope: mom.scope,
    requirements: mom.requirements,
    commercial_notes: mom.commercialNotes,
    next_action: mom.nextAction,
    mom_status: status,
    sent_at: status === 'Sent' ? new Date().toISOString() : null,
  };
}

function dbSiteMomToApp(row) {
  return {
    id: row.id,
    to: row.to_email,
    cc: row.cc_emails,
    subject: row.subject,
    summary: row.summary,
    scope: row.scope,
    requirements: row.requirements,
    commercialNotes: row.commercial_notes,
    nextAction: row.next_action,
    sent: row.mom_status === 'Sent',
    sentAt: row.sent_at,
  };
}

export async function fetchWorkflowData() {
  assertConfigured();
  console.info('[QPMS Supabase] Fetching leads directly from leads table');

  const leadsResponse = await supabase.from('leads').select('*').order('created_at', { ascending: false });

  if (leadsResponse.error) {
    console.error('[QPMS Supabase] Leads fetch failed', leadsResponse.error);
    throw leadsResponse.error;
  }

  const leadIds = (leadsResponse.data || []).map((lead) => lead.id);
  let contactsByLeadId = {};

  if (leadIds.length) {
    const contactsResponse = await supabase.from('lead_contacts').select('*').in('lead_id', leadIds);
    if (contactsResponse.error) {
      console.warn('[QPMS Supabase] lead_contacts fetch skipped/failed', contactsResponse.error);
    } else {
      contactsByLeadId = (contactsResponse.data || []).reduce((grouped, contact) => {
        grouped[contact.lead_id] = [...(grouped[contact.lead_id] || []), contact];
        return grouped;
      }, {});
      console.info('[QPMS Supabase] lead_contacts fetch success', {
        contacts: contactsResponse.data?.length || 0,
      });
    }
  }

  const visitsResponse = await supabase
    .from('site_visits')
    .select('*, leads(*), site_assessments(*), site_mom(*), activity_logs(activity_message, created_at)')
    .order('created_at', { ascending: false });

  if (visitsResponse.error) {
    console.warn('[QPMS Supabase] Site visits fetch skipped/failed', visitsResponse.error);
  }

  const leadsWithContacts = (leadsResponse.data || []).map((lead) => ({
    ...lead,
    lead_contacts: contactsByLeadId[lead.id] || [],
  }));

  console.info('[QPMS Supabase] Workflow fetch success', {
    leads: leadsResponse.data?.length || 0,
    siteVisits: visitsResponse.error ? 0 : visitsResponse.data?.length || 0,
  });
  console.info('[QPMS Supabase] Fetch leads response', leadsWithContacts);

  return {
    leads: leadsWithContacts.map(dbLeadToAppLead),
    siteVisits: visitsResponse.error ? [] : (visitsResponse.data || []).map(dbSiteVisitToApp),
  };
}

export async function createLeadRemote(lead) {
  assertConfigured();
  const { contacts = [] } = lead;
  const primaryContact = contacts.find((contact) => contact.isPrimary) || contacts[0] || {};
  const basePayload = appLeadToDbLead(lead);
  const payload = {
    ...basePayload,
    contact_person_name: primaryContact.name || null,
    contact_person_designation: primaryContact.designation || null,
    contact_number: primaryContact.phone || null,
    email_id: primaryContact.email || null,
  };
  console.info('[QPMS Supabase] Creating lead payload', {
    client_name: payload.client_name,
    assigned_bd_email: payload.assigned_bd_email,
    lead_stage: payload.lead_stage,
    contact_person_name: payload.contact_person_name,
    contactCount: contacts.length,
  });

  let { data, error } = await supabase.from('leads').insert(payload).select('*').single();
  if (error && String(error.message || '').toLowerCase().includes('schema cache')) {
    console.warn('[QPMS Supabase] Direct contact columns not available on leads; retrying lead insert without direct contact fields', error);
    const retry = await supabase.from('leads').insert(basePayload).select('*').single();
    data = retry.data;
    error = retry.error;
  }
  if (error) {
    console.error('[QPMS Supabase] Lead insert failed', error);
    throw error;
  }

  console.info('[QPMS Supabase] Lead insert success', {
    id: data.id,
    client_name: data.client_name,
  });

  if (contacts.length) {
    const { error: contactsError } = await supabase.from('lead_contacts').insert(
      contacts.map((contact) => ({
        lead_id: data.id,
        contact_person_name: contact.name,
        contact_person_designation: contact.designation,
        contact_number: contact.phone,
        email_id: contact.email,
        is_primary: Boolean(contact.isPrimary),
      })),
    );
    if (contactsError) {
      console.error('[QPMS Supabase] Lead contacts insert failed', contactsError);
      if (!['42P01', 'PGRST205'].includes(contactsError.code)) {
        throw contactsError;
      }
      console.warn('[QPMS Supabase] Lead was inserted, but lead_contacts appears unavailable. Primary contact must be stored directly in leads for this project.');
      return data.id;
    }
    console.info('[QPMS Supabase] Lead contacts insert success', {
      leadId: data.id,
      contactCount: contacts.length,
    });
  }

  await logActivity({ leadId: data.id, type: 'Lead Created', message: 'Lead Created', createdBy: lead.created_by_name });
  return data.id;
}

export async function updateLeadRemote(leadId, lead) {
  assertConfigured();
  const { error } = await supabase.from('leads').update(appLeadToDbLead(lead)).eq('id', leadId);
  if (error) throw error;

  if (lead.contacts) {
    await supabase.from('lead_contacts').delete().eq('lead_id', leadId);
    const { error: contactsError } = await supabase.from('lead_contacts').insert(
      lead.contacts.map((contact) => ({
        lead_id: leadId,
        contact_person_name: contact.name,
        contact_person_designation: contact.designation,
        contact_number: contact.phone,
        email_id: contact.email,
        is_primary: Boolean(contact.isPrimary),
      })),
    );
    if (contactsError) throw contactsError;
  }

  await logActivity({ leadId, type: 'Lead Updated', message: 'Lead Updated', createdBy: lead.created_by_name });
}

export async function saveLeadMomRemote(leadId, mom, status = 'Draft') {
  assertConfigured();
  const payload = appLeadMomToDb(mom, leadId, status);
  const { error } = await supabase.from('lead_mom').upsert(payload, { onConflict: 'lead_id' });
  if (error) throw error;
  await logActivity({ leadId, type: status === 'Sent' ? 'Lead MOM Sent' : 'Lead MOM Drafted', message: status === 'Sent' ? 'Lead MOM Sent' : 'Lead MOM Drafted' });
}

export async function createSiteVisitRemote(lead) {
  assertConfigured();
  const { data, error } = await supabase
    .from('site_visits')
    .upsert(
      {
        lead_id: lead.id,
        client_name: lead.company,
        site_name: lead.location || lead.company,
        scheduled_visit_date: lead.scheduledVisitDate || null,
        scheduled_visit_time: lead.scheduledVisitTime || null,
        assigned_bd_executive: lead.assigned_bd_executive || lead.executive,
        assigned_bd_email: lead.assigned_bd_email,
        current_stage: 'Pre-Operational Assessment',
        status: 'Scheduled',
        mom_status: 'Pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'lead_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  await logActivity({ leadId: lead.id, siteVisitId: data.id, type: 'Site Visit Scheduled', message: 'Site Visit scheduled with client' });
  return data;
}

export async function saveSiteAssessmentRemote(visit, survey, status = 'Draft', user) {
  assertConfigured();
  const payload = surveyToDbAssessment(survey, visit, status, user);
  const { data, error } = await supabase.from('site_assessments').upsert(payload, { onConflict: 'site_visit_id' }).select('*').single();
  if (error) throw error;
  await logActivity({ leadId: visit.leadId, siteVisitId: visit.id, type: status === 'Submitted' ? 'Submitted for Commercial Review' : 'Site Assessment Saved', message: status === 'Submitted' ? 'Submitted for Commercial Review' : 'Site Assessment Saved', createdBy: user?.email });
  return data;
}

export async function saveSiteMomRemote(siteVisitId, mom, status = 'Draft') {
  assertConfigured();
  const { error } = await supabase.from('site_mom').upsert(appSiteMomToDb(mom, siteVisitId, status), { onConflict: 'site_visit_id' });
  if (error) throw error;
}

export async function submitApprovalRemote(visit, assessmentId) {
  assertConfigured();
  const { error } = await supabase.from('approval_requests').insert({
    lead_id: visit.leadId,
    site_visit_id: visit.id,
    assessment_id: assessmentId,
    approval_stage: 'Commercial Review',
    pending_with: 'Commercial',
    status: 'Pending',
  });
  if (error) throw error;
  await supabase.from('site_visits').update({ current_stage: 'Commercial Review', status: 'Commercial Review', updated_at: new Date().toISOString() }).eq('id', visit.id);
}

export async function uploadSiteImageRemote({ visit, assessmentId, category, file, uploadedBy }) {
  assertConfigured();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${visit.id}/${category}/${Date.now()}-${safeName}`;
  const upload = await supabase.storage.from('site-survey-images').upload(path, file, { upsert: false });
  if (upload.error) throw upload.error;

  const { data: publicData } = supabase.storage.from('site-survey-images').getPublicUrl(path);
  const imageUrl = publicData.publicUrl;
  const { error } = await supabase.from('site_images').insert({
    site_visit_id: visit.id,
    assessment_id: assessmentId || null,
    image_category: category,
    image_url: imageUrl,
    file_name: file.name,
    uploaded_by: uploadedBy,
  });
  if (error) throw error;
  return { id: path, name: file.name, url: imageUrl };
}

export async function logActivity({ leadId, siteVisitId, type, message, createdBy }) {
  if (!isSupabaseConfigured) return;
  await supabase.from('activity_logs').insert({
    lead_id: leadId || null,
    site_visit_id: siteVisitId || null,
    activity_type: type,
    activity_message: message,
    created_by: createdBy || null,
  });
}
