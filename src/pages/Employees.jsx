import PageTemplate from './PageTemplate.jsx';

const rows = [
  { id: 1, name: 'Ananya Rao', owner: 'Sales', priority: 'Team Lead', status: 'Active', updated: 'Today' },
  { id: 2, name: 'Karthik Menon', owner: 'Operations', priority: 'Manager', status: 'Active', updated: 'Yesterday' },
  { id: 3, name: 'Priya Nair', owner: 'Support', priority: 'Senior Associate', status: 'Pending', updated: '2 days ago' },
  { id: 4, name: 'Rohan Das', owner: 'Field Ops', priority: 'Coordinator', status: 'Active', updated: 'Last week' },
];

export default function Employees() {
  return (
    <PageTemplate
      title="Employees"
      description="Maintain employee directories, roles, department ownership, and operational availability."
      rows={rows}
    />
  );
}
