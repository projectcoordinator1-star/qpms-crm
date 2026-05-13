import PageTemplate from './PageTemplate.jsx';

const rows = [
  { id: 1, name: 'North Zone Retail Hub', owner: 'Field Ops A', priority: 'High', status: 'Active', updated: 'Today' },
  { id: 2, name: 'Bengaluru Tech Park', owner: 'Field Ops B', priority: 'Medium', status: 'Pending', updated: 'Yesterday' },
  { id: 3, name: 'Chennai Logistics Yard', owner: 'Field Ops C', priority: 'High', status: 'Escalated', updated: 'Today' },
  { id: 4, name: 'Mumbai Central Office', owner: 'Field Ops A', priority: 'Low', status: 'Completed', updated: 'Last week' },
];

export default function Sites() {
  return (
    <PageTemplate
      title="Sites"
      description="Track site coverage, operational status, field ownership, and service readiness in one responsive table."
      rows={rows}
    />
  );
}
