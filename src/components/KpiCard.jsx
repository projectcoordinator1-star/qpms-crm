import { createElement } from 'react';

export default function KpiCard({ title, value, change, icon, tone = 'blue', onClick, isActive = false }) {
  const toneClass = {
    blue: 'bg-qpms-50 text-qpms-600 dark:bg-qpms-500/15 dark:text-qpms-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  }[tone];

  return (
    <article
      onClick={onClick}
      className={[
        'enterprise-card-compact relative overflow-hidden p-4 transition duration-200 sm:p-5',
        'before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-qpms-600 before:via-qpms-400 before:to-transparent',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)] dark:hover:shadow-[0_22px_70px_rgba(0,0,0,0.36)]' : '',
        isActive ? 'border-qpms-300 ring-2 ring-qpms-200 dark:border-qpms-500/50 dark:ring-qpms-500/20' : '',
      ].join(' ')}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase leading-5 tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-normal text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ring-1 ring-current/10 ${toneClass}`}>
          {createElement(icon, { className: 'h-5 w-5' })}
        </div>
      </div>
      <p className="mt-4 text-[12px] font-semibold leading-5 text-slate-500 dark:text-slate-400">{change}</p>
    </article>
  );
}
