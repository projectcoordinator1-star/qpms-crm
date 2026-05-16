import { api } from './api.js';

export async function sendLeadMomEmail(mom, lead) {
  const response = await api.post('/send-lead-mom', {
    ...mom,
    clientName: lead?.company,
    company: lead?.company,
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
