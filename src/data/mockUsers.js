export const mockUsers = [
  {
    id: 'admin',
    name: 'Admin',
    email: 'admin@qpms.co.in',
    password: '123456',
    role: 'Admin',
    access: 'Full system access',
  },
  {
    id: 'bd-head',
    name: 'BD Head',
    email: 'bdhead@qpms.co.in',
    password: '123456',
    role: 'BD Head',
    access: 'BD department workflow oversight',
  },
  {
    id: 'bd-1',
    name: 'Ananya Rao',
    email: 'bd1@qpms.co.in',
    password: '123456',
    role: 'BD Executive',
    access: 'Own leads, MOMs, site visits, and estimations',
  },
  {
    id: 'bd-2',
    name: 'Karthik Menon',
    email: 'bd2@qpms.co.in',
    password: '123456',
    role: 'BD Executive',
    access: 'Own leads, MOMs, site visits, and estimations',
  },
  {
    id: 'bd-3',
    name: 'Nisha Iyer',
    email: 'bd3@qpms.co.in',
    password: '123456',
    role: 'BD Executive',
    access: 'Own leads, MOMs, site visits, and estimations',
  },
  {
    id: 'commercial-1',
    name: 'Commercial Team 1',
    email: 'commercial1@qpms.co.in',
    password: '123456',
    role: 'Commercial Reviewer',
    access: 'Commercial review queue and approval actions',
  },
  {
    id: 'commercial-2',
    name: 'Commercial Team 2',
    email: 'commercial2@qpms.co.in',
    password: '123456',
    role: 'Commercial Reviewer',
    access: 'Commercial review queue and approval actions',
  },
  {
    id: 'finance-1',
    name: 'Finance Team 1',
    email: 'finance1@qpms.co.in',
    password: '123456',
    role: 'Finance Reviewer',
    access: 'Finance review queue and approval actions',
  },
  {
    id: 'finance-2',
    name: 'Finance Team 2',
    email: 'finance2@qpms.co.in',
    password: '123456',
    role: 'Finance Reviewer',
    access: 'Finance review queue and approval actions',
  },
  {
    id: 'hr-1',
    name: 'HR Reviewer 1',
    email: 'hr1@qpms.co.in',
    password: '123456',
    role: 'HR Reviewer',
    access: 'HR manpower and wage review queue',
  },
  {
    id: 'hr-2',
    name: 'HR Reviewer 2',
    email: 'hr2@qpms.co.in',
    password: '123456',
    role: 'HR Reviewer',
    access: 'HR manpower and wage review queue',
  },
];

export const bdExecutives = mockUsers.filter((user) => user.role === 'BD Executive');
export const commercialTeamUsers = mockUsers.filter((user) => user.role === 'Commercial Reviewer');
export const financeTeamUsers = mockUsers.filter((user) => user.role === 'Finance Reviewer');
export const hrReviewerUsers = mockUsers.filter((user) => user.role === 'HR Reviewer');

export function isCommercialTeam(user) {
  return ['Commercial Reviewer', 'Commercial Team', 'Commercial'].includes(user?.role);
}

export function isFinanceTeam(user) {
  return ['Finance Reviewer', 'Finance Team', 'Finance'].includes(user?.role);
}

export function isHrReviewer(user) {
  return user?.role === 'HR Reviewer';
}

export function isApprovalReviewer(user) {
  return isCommercialTeam(user) || isFinanceTeam(user) || isHrReviewer(user);
}

export function canManageLeads(user) {
  return ['Admin', 'BD Head', 'BD Executive'].includes(user?.role);
}

export function canViewBdTeam(user) {
  return ['Admin', 'BD Head'].includes(user?.role);
}

export function findMockUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  return mockUsers.find((user) => user.email === normalizedEmail && user.password === password);
}

export function getExecutiveByName(name) {
  return bdExecutives.find((user) => user.name === name);
}
