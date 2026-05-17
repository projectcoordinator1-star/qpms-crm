import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const toastTone = {
  success: {
    icon: CheckCircle2,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    className:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300',
  },
  warning: {
    icon: AlertTriangle,
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300',
  },
  info: {
    icon: Info,
    className:
      'border-qpms-200 bg-qpms-50 text-qpms-700 dark:border-qpms-500/25 dark:bg-qpms-500/10 dark:text-qpms-300',
  },
};

export default function Toast({ message, type = 'success' }) {
  if (!message) return null;

  const tone = toastTone[type] || toastTone.info;
  const Icon = tone.icon;

  return (
    <div
      className={`toast-enter flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${tone.className}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
