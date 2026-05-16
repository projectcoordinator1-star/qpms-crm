import { useEffect, useState } from 'react';
import { leadRows } from '../data/qpmsWorkflowData.js';
import { WorkflowContext } from './workflow-context.js';

const leadsStorageKey = 'qpms-crm-workflow-leads';
const siteVisitsStorageKey = 'qpms-crm-workflow-site-visits';

const defaultLeadDetails = {
  industry: 'Facility Management',
  location: 'Client site pending confirmation',
  state: 'Tamil Nadu',
  city: 'Chennai',
  designation: 'Facility Manager',
  phone: '+91 98765 21000',
  email: 'client@example.com',
  priority: 'Medium',
  remarks: 'Initial lead captured for QPMS business workflow.',
  activity: [],
};

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeLead(lead) {
  return {
    ...defaultLeadDetails,
    ...lead,
    leadId: lead.leadId || `LD-${String(lead.id).padStart(4, '0')}`,
    stage: lead.stage || 'New Lead',
    status: lead.status || 'Active',
    executive: lead.executive || 'Unassigned',
    activity: lead.activity || ['Lead record available in desktop workflow'],
  };
}

function buildSiteVisitFromLead(lead) {
  return {
    id: `SV-${lead.id}`,
    leadId: lead.id,
    company: lead.company,
    industry: lead.industry,
    contact: lead.contact,
    designation: lead.designation,
    phone: lead.phone,
    email: lead.email,
    source: lead.source,
    priority: lead.priority,
    executive: lead.executive,
    location: lead.location,
    state: lead.state,
    city: lead.city,
    scheduledVisitDate: lead.scheduledVisitDate || '',
    scheduledVisitTime: lead.scheduledVisitTime || '',
    siteVisitRemarks: lead.siteVisitRemarks || '',
    momStatus: 'Pending',
    status: 'Scheduled',
    currentStage: 'Pre-Operational Assessment',
    createdFrom: 'Lead MOM Sent',
    survey: {
      siteAddress: lead.location,
      siteType: lead.industry,
      operatingHours: '',
      ifmScope: '',
      hardServices: '',
      softServices: '',
      landscaping: '',
      pestControl: '',
      hseCompliance: '',
      manpower: '',
      tools: '',
      equipment: '',
      consumables: '',
      clientKyc: '',
      riskAssessment: '',
      commercialStatement: '',
      approvalWorkflow: '',
      finalRemarks: '',
    },
    siteMom: null,
    activity: ['Site Visit scheduled with client', 'Lead MOM sent. Site survey workflow opened.'],
  };
}

function upsertById(items, nextItem) {
  const exists = items.some((item) => item.id === nextItem.id);
  return exists ? items.map((item) => (item.id === nextItem.id ? nextItem : item)) : [nextItem, ...items];
}

export function WorkflowProvider({ children }) {
  const [leads, setLeads] = useState(() => readStorage(leadsStorageKey, leadRows.map(normalizeLead)));
  const [siteVisits, setSiteVisits] = useState(() => readStorage(siteVisitsStorageKey, []));

  useEffect(() => {
    window.localStorage.setItem(leadsStorageKey, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    window.localStorage.setItem(siteVisitsStorageKey, JSON.stringify(siteVisits));
  }, [siteVisits]);

  function addLead(lead) {
    const nextLead = normalizeLead({
      ...lead,
      id: Date.now(),
      leadId: `LD-${Date.now().toString().slice(-5)}`,
      stage: 'New Lead',
      status: 'Active',
      executive: lead.executive || 'Unassigned',
      activity: ['New lead created from desktop application'],
    });

    setLeads((current) => [nextLead, ...current]);
    return nextLead;
  }

  function updateLead(leadId, updater) {
    setLeads((current) =>
      current.map((lead) => {
        if (lead.id !== leadId) return lead;
        const patch = typeof updater === 'function' ? updater(lead) : updater;
        return { ...lead, ...patch };
      }),
    );
  }

  function addLeadActivity(leadId, message) {
    updateLead(leadId, (lead) => ({
      activity: [message, ...(lead.activity || [])].slice(0, 8),
    }));
  }

  function saveLeadMomDraft(leadId, mom) {
    updateLead(leadId, (lead) => ({
      mom: { ...mom, sent: Boolean(mom.sent) },
      activity: ['Lead MOM draft saved', ...(lead.activity || [])].slice(0, 8),
    }));
  }

  function sendLeadMom(leadId, mom) {
    let createdVisit = null;

    setLeads((currentLeads) =>
      currentLeads.map((lead) => {
        if (lead.id !== leadId) return lead;

        const nextLead = {
          ...lead,
          stage: 'Site Visit Scheduled',
          scheduledVisitDate: mom.scheduledVisitDate || '',
          scheduledVisitTime: mom.scheduledVisitTime || '',
          siteVisitRemarks: mom.siteVisitRemarks || '',
          mom: { ...mom, sent: true, sentAt: new Date().toISOString() },
          activity: [
            'Site Visit scheduled with client',
            'Lead MOM sent to client. Moved to Site Visit & Estimation.',
            ...(lead.activity || []),
          ].slice(0, 8),
        };
        createdVisit = buildSiteVisitFromLead(nextLead);
        return nextLead;
      }),
    );

    if (createdVisit) {
      setSiteVisits((current) => upsertById(current, createdVisit));
    }

    return createdVisit;
  }

  function updateSiteVisit(siteVisitId, updater) {
    setSiteVisits((current) =>
      current.map((visit) => {
        if (visit.id !== siteVisitId) return visit;
        const patch = typeof updater === 'function' ? updater(visit) : updater;
        return { ...visit, ...patch };
      }),
    );
  }

  function saveSiteSurvey(siteVisitId, survey) {
    updateSiteVisit(siteVisitId, (visit) => ({
      survey: { ...visit.survey, ...survey },
      activity: ['Site survey draft saved', ...(visit.activity || [])].slice(0, 8),
    }));
  }

  function saveSiteVisitMom(siteVisitId, mom) {
    updateSiteVisit(siteVisitId, (visit) => ({
      siteMom: { ...mom, sent: Boolean(mom.sent) },
      momStatus: 'Created',
      status: 'Site Visit MOM Created',
      activity: ['Site Visit MOM generated', ...(visit.activity || [])].slice(0, 8),
    }));
  }

  function sendSiteVisitMom(siteVisitId, mom) {
    updateSiteVisit(siteVisitId, (visit) => ({
      siteMom: { ...mom, sent: true, sentAt: new Date().toISOString() },
      momStatus: 'Sent',
      status: 'Site Visit MOM Sent',
      activity: ['Site Visit MOM sent to client and internal stakeholders', ...(visit.activity || [])].slice(0, 8),
    }));
  }

  function submitCommercialReview(siteVisitId) {
    updateSiteVisit(siteVisitId, (visit) => ({
      status: 'Commercial Review',
      currentStage: 'Commercial Review',
      activity: ['Submitted for Commercial Review', ...(visit.activity || [])].slice(0, 8),
    }));
  }

  const value = {
    leads,
    siteVisits,
    addLead,
    updateLead,
    addLeadActivity,
    saveLeadMomDraft,
    sendLeadMom,
    updateSiteVisit,
    saveSiteSurvey,
    saveSiteVisitMom,
    sendSiteVisitMom,
    submitCommercialReview,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}
