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
