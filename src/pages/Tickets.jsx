import PageTemplate from './PageTemplate.jsx';

const rows = [
  { id: 1, name: 'Generator maintenance SLA', owner: 'Priya Nair', priority: 'Critical', status: 'Escalated', updated: '15 min ago' },
  { id: 2, name: 'Access card replacement', owner: 'Imran Khan', priority: 'Medium', status: 'Open', updated: '1 hour ago' },
  { id: 3, name: 'HVAC inspection request', owner: 'Meera Pillai', priority: 'High', status: 'Pending', updated: 'Today' },
  { id: 4, name: 'Monthly audit closure', owner: 'Rohan Das', priority: 'Low', status: 'Completed', updated: 'Yesterday' },
];

export default function Tickets() {
  return (
    <PageTemplate
      title="Tickets"
      description="Monitor incoming service tickets, escalations, ownership, and response priorities for customer operations."
      rows={rows}
    />
  );
}
