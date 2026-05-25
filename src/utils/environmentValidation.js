import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import { isProductionAuthMode } from './authRoles.js';

const REQUIRED_RPC_FUNCTIONS = [
  'rpc_convert_lead_to_assessment',
  'rpc_save_assessment_section',
  'rpc_submit_for_review',
  'rpc_record_approval_decision',
  'rpc_create_notification',
  'rpc_mark_notification_read',
  'rpc_generate_proposal_record',
  'rpc_log_workflow_event',
];

function currentAppMode() {
  return String(import.meta.env.VITE_APP_MODE || '').trim().toLowerCase();
}

function result(name, passed, details = {}) {
  if (!passed) {
    console.warn(`[myQPMS Environment Validation] ${name}`, details);
  }
  return { name, passed, ...details };
}

export function validateEnvironment() {
  const mode = currentAppMode();
  const findings = [
    result('VITE_APP_MODE exists', Boolean(mode), { mode: mode || 'missing' }),
    result('VITE_APP_MODE is valid', !mode || ['demo', 'production'].includes(mode), { mode: mode || 'missing' }),
    result('Supabase env exists in production', mode !== 'production' || isSupabaseConfigured, {
      mode: mode || 'missing',
      isSupabaseConfigured,
    }),
    result('Supabase Auth mandatory in production', !isProductionAuthMode || isSupabaseConfigured, {
      mode: mode || 'missing',
      isProductionAuthMode,
      isSupabaseConfigured,
    }),
    result('Demo mode warning in production build', !(import.meta.env.PROD && mode === 'demo'), {
      build: import.meta.env.PROD ? 'production' : 'development',
      mode: mode || 'missing',
    }),
  ];

  return {
    appMode: mode || 'missing',
    isSupabaseConfigured,
    passed: findings.every((item) => item.passed),
    findings,
  };
}

export async function checkRpcAvailability(functionNames = REQUIRED_RPC_FUNCTIONS) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      passed: false,
      checks: functionNames.map((name) => ({ name, passed: false, error: 'Supabase is not configured' })),
    };
  }

  const checks = await Promise.all(
    functionNames.map(async (name) => {
      try {
        let response;
        if (name === 'rpc_mark_notification_read') {
          response = await supabase.rpc(name, { p_notification_id: '00000000-0000-0000-0000-000000000000', p_reader_user_id: null });
        } else if (name === 'rpc_log_workflow_event') {
          response = await supabase.rpc(name, { p_workflow_instance_id: 'invalid-uuid-for-availability-check' });
        } else {
          response = await supabase.rpc(name, {});
        }
        if (response?.error) throw response.error;
        return { name, passed: true };
      } catch (error) {
        const message = error?.message || String(error);
        const functionMissing = error?.code === 'PGRST202' || error?.code === '42883' || message.toLowerCase().includes('function');
        return {
          name,
          passed: !functionMissing,
          warning: functionMissing ? undefined : message,
          error: functionMissing ? message : undefined,
        };
      }
    }),
  );

  const failed = checks.filter((check) => !check.passed);
  if (failed.length) {
    console.warn('[myQPMS Environment Validation] RPC availability check failed', failed);
  }

  return {
    passed: failed.length === 0,
    checks,
  };
}

export { REQUIRED_RPC_FUNCTIONS };
