export const appMode = String(import.meta.env.VITE_APP_MODE || 'demo').toLowerCase();
export const isProductionAuthMode = appMode === 'production';

export const roleGroups = {
  BD: ['BD', 'BD Team', 'BD Executive', 'BD Head'],
  Operations: ['Operations', 'Operations Team'],
  Coordinator: ['Coordinator'],
  HR: ['HR', 'HR Reviewer'],
  Commercial: ['Commercial', 'Commercial Team', 'Commercial Reviewer'],
  Finance: ['Finance', 'Finance Team', 'Finance Reviewer'],
  Management: ['Management', 'COO', 'BD Head'],
  Admin: ['Admin'],
};

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
  if (pathname.startsWith('/crm')) return ['Admin', 'Management', 'BD'];
  if (pathname.startsWith('/sites') || pathname.startsWith('/site-visit')) return ['Admin', 'Management', 'BD', 'Operations', 'Coordinator', 'HR', 'Commercial', 'Finance'];
  if (pathname.startsWith('/tasks')) return ['Admin', 'Management', 'Operations', 'Coordinator', 'HR', 'Commercial', 'Finance'];
  if (pathname.startsWith('/employees')) return ['Admin', 'Management'];
  if (pathname.startsWith('/reports')) return ['Admin', 'Management'];
  return [];
}

export function canAccessRoute(user, pathname) {
  return hasAnyRole(user, routeAllowedRoles(pathname));
}

