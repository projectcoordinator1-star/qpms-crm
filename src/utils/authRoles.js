export const appMode = String(import.meta.env.VITE_APP_MODE || 'demo').toLowerCase();
export const isProductionAuthMode = appMode === 'production';

export const roleGroups = {
  BD: ['BD', 'BD Team', 'BD Executive', 'BD Head'],
  Operations: ['Operations', 'Operations Team'],
  Coordinator: ['Coordinator'],
  HR: ['HR', 'HR Reviewer'],
  Commercial: ['Commercial', 'Commercial Team', 'Commercial Reviewer'],
  Finance: ['Finance', 'Finance Team', 'Finance Reviewer'],
  FinanceLeadership: ['Finance GM', 'CFO'],
  Management: ['Management', 'COO', 'GM', 'Top Management', 'GM / Top Management'],
  ExistingOperations: ['Existing Business Operations Team'],
  FieldOfficer: ['Field Officer', 'FO'],
  Client: ['Client', 'Client Login'],
  Admin: ['Admin'],
};

export const protectedNavRoutes = ['/dashboard', '/crm', '/sites', '/site-visit', '/tasks', '/fo-activities', '/tickets', '/reports', '/employees', '/settings'];

export function normalizeAppRole(role = '') {
  const match = Object.entries(roleGroups).find(([, aliases]) => aliases.includes(role));
  return match?.[0] || role || 'BD';
}

export function hasAnyRole(user, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  if (!user) return false;
  const normalized = normalizeAppRole(user.role);
  return allowedRoles.some((role) => normalizeAppRole(role) === normalized || role === user.role);
}

export function routeAllowedRoles(pathname = '') {
  if (pathname.startsWith('/dashboard')) return [];
  if (pathname.startsWith('/settings')) return [];
  if (pathname.startsWith('/crm')) return ['Admin', 'Management', 'BD'];
  if (pathname.startsWith('/sites') || pathname.startsWith('/site-visit')) return ['BD'];
  if (pathname.startsWith('/tasks')) return ['Operations', 'Coordinator', 'HR', 'Commercial', 'Finance'];
  if (pathname.startsWith('/fo-activities')) return ['Admin', 'Management', 'ExistingOperations'];
  if (pathname.startsWith('/employees')) return ['Admin', 'Management'];
  if (pathname.startsWith('/reports')) return ['Admin', 'Management'];
  if (pathname.startsWith('/tickets')) return ['ExistingOperations'];
  return [];
}

export function canAccessRoute(user, pathname) {
  return hasAnyRole(user, routeAllowedRoles(pathname));
}

export function canAccessNavRoute(user, pathname) {
  if (!protectedNavRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return true;
  return canAccessRoute(user, pathname);
}
