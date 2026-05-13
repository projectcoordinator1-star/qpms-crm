import PageTemplate from './PageTemplate.jsx';

const rows = [
  { id: 1, name: 'Monthly SLA summary', owner: 'Operations', priority: 'High', status: 'Completed', updated: 'Today' },
  { id: 2, name: 'Revenue forecast', owner: 'Finance', priority: 'High', status: 'Active', updated: 'Yesterday' },
  { id: 3, name: 'Ticket aging analysis', owner: 'Support', priority: 'Medium', status: 'Pending', updated: '2 days ago' },
  { id: 4, name: 'Employee productivity', owner: 'HR', priority: 'Medium', status: 'Open', updated: 'Last week' },
];

export default function Reports() {
  return (
    <PageTemplate
      title="Reports"
      description="Review operational, financial, and service performance reporting with export-ready table foundations."
      rows={rows}
    />
  );
}
