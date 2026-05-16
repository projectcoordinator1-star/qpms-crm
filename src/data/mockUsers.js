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
];

export const bdExecutives = mockUsers.filter((user) => user.role === 'BD Executive');

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
