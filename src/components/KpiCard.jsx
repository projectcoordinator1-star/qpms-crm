import { createElement } from 'react';

export default function KpiCard({ title, value, change, icon, tone = 'blue' }) {
  const toneClass = {
    blue: 'bg-qpms-50 text-qpms-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }[tone];

  return (
    <article className="enterprise-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium leading-5 text-slate-500">{title}</p>
          <p className="mt-3 text-[30px] font-semibold leading-none tracking-normal text-slate-950">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneClass}`}>
          {createElement(icon, { className: 'h-5 w-5' })}
        </div>
      </div>
      <p className="mt-5 text-[13px] font-medium leading-5 text-emerald-600">{change}</p>
    </article>
  );
}
