import { createElement } from 'react';

export default function KpiCard({ title, value, change, icon, tone = 'blue' }) {
  const toneClass = {
    blue: 'bg-qpms-50 text-qpms-600 dark:bg-qpms-500/15 dark:text-qpms-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  }[tone];

  return (
    <article className="enterprise-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium leading-5 text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-3 text-[30px] font-semibold leading-none tracking-normal text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneClass}`}>
          {createElement(icon, { className: 'h-5 w-5' })}
        </div>
      </div>
      <p className="mt-5 text-[13px] font-medium leading-5 text-slate-500 dark:text-slate-400">{change}</p>
    </article>
  );
}
