import { useEffect, useState } from 'react';
import { leadRows } from '../data/qpmsWorkflowData.js';
import { bdExecutives, getExecutiveByName } from '../data/mockUsers.js';
import {
  createLeadRemote,
  createSiteVisitRemote,
  deleteLeadRemote,
  fetchWorkflowData,
  isRemoteWorkflowEnabled,
  saveLeadMomRemote,
  saveSiteAssessmentRemote,
  saveSiteMomRemote,
  submitApprovalRemote,
  updateLeadRemote,
  uploadSiteImageRemote,
} from '../services/workflowRepository.js';
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

function createFallbackContact(lead) {
  return {
    id: `contact-${lead.id || Date.now()}-primary`,
    name: lead.contact || '',
    designation: lead.designation || '',
    phone: lead.phone || '',
    email: lead.email || '',
    isPrimary: true,
  };
}

function normalizeContacts(contacts, lead = {}) {
  const sourceContacts = Array.isArray(contacts) && contacts.length ? contacts : [createFallbackContact(lead)];
  const hasPrimary = sourceContacts.some((contact) => contact.isPrimary);

  return sourceContacts.map((contact, index) => ({
    id: contact.id || `contact-${Date.now()}-${index}`,
    name: contact.name || '',
    designation: contact.designation || '',
    phone: contact.phone || '',
    email: contact.email || '',
    isPrimary: sourceContacts.length === 1 ? true : hasPrimary ? Boolean(contact.isPrimary) : index === 0,
  }));
}

function getPrimaryContact(lead) {
  return normalizeContacts(lead.contacts, lead).find((contact) => contact.isPrimary) || normalizeContacts(lead.contacts, lead)[0];
}

function ownerFieldsForExecutive(executiveName) {
  const executive = getExecutiveByName(executiveName) || bdExecutives[0];
  return {
    executive: executive?.name || executiveName || 'Unassigned',
    assigned_bd_executive: executive?.name || executiveName || 'Unassigned',
    assigned_bd_email: executive?.email || '',
    created_by_user_id: executive?.id || '',
    created_by_name: executive?.name || executiveName || 'Unassigned',
  };
}

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
  const contacts = normalizeContacts(lead.contacts, lead);
  const primaryContact = contacts.find((contact) => contact.isPrimary) || contacts[0];
  const ownerFields = ownerFieldsForExecutive(lead.executive || lead.assigned_bd_executive);

  return {
    ...defaultLeadDetails,
    ...lead,
    ...ownerFields,
    ...lead,
    executive: lead.executive || ownerFields.executive,
    assigned_bd_executive: lead.assigned_bd_executive || ownerFields.assigned_bd_executive,
    assigned_bd_email: lead.assigned_bd_email || ownerFields.assigned_bd_email,
    created_by_user_id: lead.created_by_user_id || ownerFields.created_by_user_id,
    created_by_name: lead.created_by_name || ownerFields.created_by_name,
    contacts,
    contact: primaryContact?.name || '',
    designation: primaryContact?.designation || '',
    phone: primaryContact?.phone || '',
    email: primaryContact?.email || '',
    leadId: lead.leadId || `LD-${String(lead.id).padStart(4, '0')}`,
    stage: lead.stage || 'New Lead',
    status: lead.status || 'Active',
    activity: lead.activity || ['Lead record available in desktop workflow'],
  };
}

function buildSiteVisitFromLead(lead) {
  const primaryContact = getPrimaryContact(lead);

  return {
    id: `SV-${lead.id}`,
    leadId: lead.id,
    company: lead.company,
    industry: lead.industry,
    contacts: normalizeContacts(lead.contacts, lead),
    contact: primaryContact?.name || '',
    designation: primaryContact?.designation || '',
    phone: primaryContact?.phone || '',
    email: primaryContact?.email || '',
    source: lead.source,
    priority: lead.priority,
    executive: lead.executive,
    assigned_bd_executive: lead.assigned_bd_executive,
    assigned_bd_email: lead.assigned_bd_email,
    created_by_user_id: lead.created_by_user_id,
    created_by_name: lead.created_by_name,
    location: lead.location,
    siteName: lead.location || lead.company,
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
  const [leads, setLeads] = useState(() => (isRemoteWorkflowEnabled() ? [] : readStorage(leadsStorageKey, leadRows).map(normalizeLead)));
  const [siteVisits, setSiteVisits] = useState(() => (isRemoteWorkflowEnabled() ? [] : readStorage(siteVisitsStorageKey, [])));
  const [backendStatus, setBackendStatus] = useState(isRemoteWorkflowEnabled() ? 'connecting' : 'local');
  const [workflowError, setWorkflowError] = useState('');

  useEffect(() => {
    if (!isRemoteWorkflowEnabled()) {
      console.info('[QPMS Workflow] Supabase env missing; using local/mock workflow storage');
      return;
    }

    let active = true;
    console.info('[QPMS Workflow] Supabase env detected; loading remote workflow data');
    refreshWorkflowData()
      .then(() => {
        if (!active) return;
      })
      .catch(() => {
        if (active) setBackendStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshWorkflowData() {
    if (!isRemoteWorkflowEnabled()) return;
    setBackendStatus('connecting');
    setWorkflowError('');
    return fetchWorkflowData()
      .then((data) => {
        setLeads(data.leads.map(normalizeLead));
        setSiteVisits(data.siteVisits);
        setBackendStatus('connected');
        console.info('[QPMS Workflow] Supabase workflow connected', {
          leads: data.leads.length,
          siteVisits: data.siteVisits.length,
        });
      })
      .catch((error) => {
        console.error('[QPMS Workflow] Supabase fetch failed; mock data disabled for remote mode', error);
        setLeads([]);
        setSiteVisits([]);
        setBackendStatus('error');
        setWorkflowError(`Supabase fetch failed: ${error.message}`);
        throw error;
      });
  }

  useEffect(() => {
    if (isRemoteWorkflowEnabled()) return;
    window.localStorage.setItem(leadsStorageKey, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    if (isRemoteWorkflowEnabled()) return;
    window.localStorage.setItem(siteVisitsStorageKey, JSON.stringify(siteVisits));
  }, [siteVisits]);

  async function addLead(lead, user) {
    const selectedExecutive = user?.role === 'BD Executive' ? user.name : lead.executive || lead.assigned_bd_executive || bdExecutives[0]?.name;
    const ownerFields = user?.role === 'BD Executive'
      ? {
          executive: user.name,
          assigned_bd_executive: user.name,
          assigned_bd_email: user.email,
          created_by_user_id: user.id,
          created_by_name: user.name,
        }
      : ownerFieldsForExecutive(selectedExecutive);
    const nextLead = normalizeLead({
      ...lead,
      ...ownerFields,
      id: isRemoteWorkflowEnabled() && typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now(),
      leadId: `LD-${Date.now().toString().slice(-5)}`,
      stage: 'New Lead',
      status: 'Active',
      contacts: normalizeContacts(lead.contacts, lead),
      activity: ['New lead created from desktop application'],
    });

    console.info('[QPMS Workflow] Add lead invoked', {
      mode: isRemoteWorkflowEnabled() ? 'supabase' : 'local',
      leadId: nextLead.id,
      company: nextLead.company,
      contactCount: nextLead.contacts?.length || 0,
    });
    if (isRemoteWorkflowEnabled()) {
      setBackendStatus('saving');
      setWorkflowError('');
      try {
        const insertedId = await createLeadRemote(nextLead);
        console.info('[QPMS Workflow] Lead insert complete; refetching Supabase leads', { insertedId });
        await refreshWorkflowData();
        return { ...nextLead, id: insertedId };
      } catch (error) {
        console.error('[QPMS Workflow] Lead Supabase insert failed', error);
        setBackendStatus('error');
        setWorkflowError(`Lead insert failed: ${error.message}`);
        throw error;
      }
    }
    setLeads((current) => [nextLead, ...current]);
    return nextLead;
  }

  async function deleteLead(leadId, user) {
    const leadToDelete = leads.find((lead) => lead.id === leadId);
    setLeads((current) => current.filter((lead) => lead.id !== leadId));
    setSiteVisits((current) => current.filter((visit) => visit.leadId !== leadId));

    if (!isRemoteWorkflowEnabled()) return;

    setBackendStatus('saving');
    setWorkflowError('');
    try {
      await deleteLeadRemote(leadId, user?.name || user?.email || leadToDelete?.created_by_name);
      await refreshWorkflowData();
    } catch (error) {
      console.error('[QPMS Workflow] Lead Supabase delete failed', error);
      setBackendStatus('error');
      setWorkflowError(`Lead delete failed: ${error.message}`);
      if (leadToDelete) setLeads((current) => upsertById(current, leadToDelete));
      throw error;
    }
  }

  function updateLead(leadId, updater) {
    setLeads((current) =>
      current.map((lead) => {
        if (lead.id !== leadId) return lead;
        const patch = typeof updater === 'function' ? updater(lead) : updater;
        const nextLead = normalizeLead({ ...lead, ...patch });
        if (isRemoteWorkflowEnabled()) {
          updateLeadRemote(leadId, nextLead).catch((error) => {
            console.warn('Lead Supabase update failed:', error.message);
            setBackendStatus('fallback');
          });
        }
        return nextLead;
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
    if (isRemoteWorkflowEnabled()) {
      saveLeadMomRemote(leadId, mom, 'Draft').catch((error) => {
        console.warn('Lead MOM Supabase save failed:', error.message);
        setBackendStatus('fallback');
      });
    }
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
        if (isRemoteWorkflowEnabled()) {
          Promise.all([
            updateLeadRemote(leadId, nextLead),
            saveLeadMomRemote(leadId, mom, 'Sent'),
            createSiteVisitRemote(nextLead),
          ])
            .then(() => refreshWorkflowData())
            .catch((error) => {
              console.warn('Lead MOM/Site Visit Supabase save failed:', error.message);
              setBackendStatus('fallback');
            });
        }
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

  function saveSiteSurvey(siteVisitId, survey, status = 'Draft', user) {
    const visit = siteVisits.find((item) => item.id === siteVisitId);
    updateSiteVisit(siteVisitId, (visit) => ({
      survey: { ...visit.survey, ...survey },
      activity: ['Site survey draft saved', ...(visit.activity || [])].slice(0, 8),
    }));
    if (isRemoteWorkflowEnabled() && visit) {
      saveSiteAssessmentRemote(visit, survey, status, user).catch((error) => {
        console.warn('Site assessment Supabase save failed:', error.message);
        setBackendStatus('fallback');
      });
    }
  }

  function saveSiteVisitMom(siteVisitId, mom) {
    updateSiteVisit(siteVisitId, (visit) => ({
      siteMom: { ...mom, sent: Boolean(mom.sent) },
      momStatus: 'Created',
      status: 'Site Visit MOM Created',
      activity: ['Site Visit MOM generated', ...(visit.activity || [])].slice(0, 8),
    }));
    if (isRemoteWorkflowEnabled()) {
      saveSiteMomRemote(siteVisitId, mom, 'Draft').catch((error) => {
        console.warn('Site MOM Supabase save failed:', error.message);
        setBackendStatus('fallback');
      });
    }
  }

  function sendSiteVisitMom(siteVisitId, mom) {
    updateSiteVisit(siteVisitId, (visit) => ({
      siteMom: { ...mom, sent: true, sentAt: new Date().toISOString() },
      momStatus: 'Sent',
      status: 'Site Visit MOM Sent',
      activity: ['Site Visit MOM sent to client and internal stakeholders', ...(visit.activity || [])].slice(0, 8),
    }));
    if (isRemoteWorkflowEnabled()) {
      saveSiteMomRemote(siteVisitId, mom, 'Sent').catch((error) => {
        console.warn('Site MOM Supabase send save failed:', error.message);
        setBackendStatus('fallback');
      });
    }
  }

  function submitCommercialReview(siteVisitId) {
    const visit = siteVisits.find((item) => item.id === siteVisitId);
    updateSiteVisit(siteVisitId, (visit) => ({
      status: 'Commercial Review',
      currentStage: 'Commercial Review',
      activity: ['Submitted for Commercial Review', ...(visit.activity || [])].slice(0, 8),
    }));
    if (isRemoteWorkflowEnabled() && visit) {
      submitApprovalRemote(visit, visit.assessmentId).catch((error) => {
        console.warn('Approval Supabase submit failed:', error.message);
        setBackendStatus('fallback');
      });
    }
  }

  async function uploadSiteImage(payload) {
    if (!isRemoteWorkflowEnabled()) return null;
    try {
      return await uploadSiteImageRemote(payload);
    } catch (error) {
      console.warn('Site image Supabase upload failed:', error.message);
      setBackendStatus('fallback');
      return null;
    }
  }

  const value = {
    leads,
    siteVisits,
    backendStatus,
    workflowError,
    refreshWorkflowData,
    addLead,
    deleteLead,
    updateLead,
    addLeadActivity,
    saveLeadMomDraft,
    sendLeadMom,
    updateSiteVisit,
    saveSiteSurvey,
    saveSiteVisitMom,
    sendSiteVisitMom,
    submitCommercialReview,
    uploadSiteImage,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}
