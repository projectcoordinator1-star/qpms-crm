import { api } from './api.js';

export async function sendLeadMomEmail(mom, lead) {
  const response = await api.post('/send-lead-mom', {
    ...mom,
    clientName: lead?.company,
    company: lead?.company,
    primaryContact: lead?.contact,
    primaryContactEmail: lead?.email,
    serviceScope: mom?.serviceScope || lead?.serviceScope || lead?.service_scope || [],
    location: lead?.location,
    assignedBdExecutive: lead?.assigned_bd_executive || lead?.executive,
    assignedBdEmail: lead?.assigned_bd_email,
  });
  return response.data;
}

export async function sendSiteVisitMomEmail(mom, visit) {
  const response = await api.post('/send-sitevisit-mom', {
    ...mom,
    clientName: visit?.company,
    company: visit?.company,
  });
  return response.data;
}

export async function sendProposalEmail(proposal, visit) {
  try {
    const response = await api.post('/send-proposal', {
      ...proposal,
      clientName: visit?.company,
      company: visit?.company,
      primaryContact: visit?.contact,
      primaryContactEmail: visit?.email,
      siteLocation: visit?.location,
    });
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Proposal mail endpoint is not available on the backend yet. Expected POST /send-proposal on VITE_API_URL.');
    }
    throw error;
  }
}
