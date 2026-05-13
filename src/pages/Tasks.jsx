import PageTemplate from './PageTemplate.jsx';

const rows = [
  { id: 1, name: 'Quarterly compliance checklist', owner: 'Deepa S', priority: 'High', status: 'Pending', updated: 'Today' },
  { id: 2, name: 'Renewal document review', owner: 'Sanjay M', priority: 'Medium', status: 'Active', updated: 'Yesterday' },
  { id: 3, name: 'Safety drill confirmation', owner: 'Ankit J', priority: 'Medium', status: 'Completed', updated: '2 days ago' },
  { id: 4, name: 'Vendor quote validation', owner: 'Leena R', priority: 'High', status: 'Open', updated: 'Today' },
];

export default function Tasks() {
  return (
    <PageTemplate
      title="Tasks"
      description="Coordinate assignments, follow-ups, approvals, and completion status across departments."
      rows={rows}
    />
  );
}
