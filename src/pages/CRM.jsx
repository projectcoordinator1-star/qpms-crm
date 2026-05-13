import PageTemplate from './PageTemplate.jsx';

const rows = [
  { id: 1, name: 'Acme Facilities Pvt Ltd', owner: 'Ananya Rao', priority: 'High', status: 'Active', updated: 'Today' },
  { id: 2, name: 'BluePeak Infrastructure', owner: 'Karthik Menon', priority: 'Medium', status: 'Pending', updated: 'Yesterday' },
  { id: 3, name: 'Metro Services Group', owner: 'Nisha Iyer', priority: 'High', status: 'Active', updated: '2 days ago' },
  { id: 4, name: 'Greenline Estates', owner: 'Rahul Shah', priority: 'Low', status: 'Completed', updated: '4 days ago' },
];

export default function CRM() {
  return (
    <PageTemplate
      title="CRM"
      description="Manage accounts, opportunities, renewals, and relationship health across the QPMS customer base."
      rows={rows}
    />
  );
}
