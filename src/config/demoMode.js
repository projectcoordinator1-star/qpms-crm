export const isDemoMode = String(import.meta.env.VITE_DEMO_MODE ?? 'true').toLowerCase() !== 'false';
