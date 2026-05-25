import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url) {
  return (url || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

console.info('[myQPMS Supabase] Config check', {
  configured: isSupabaseConfigured,
  urlPresent: Boolean(supabaseUrl),
  anonKeyPresent: Boolean(supabaseAnonKey),
  normalizedUrl: supabaseUrl || 'missing',
});

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 8,
        },
      },
    })
  : null;
