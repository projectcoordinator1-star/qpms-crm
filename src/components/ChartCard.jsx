export default function ChartCard({ title, description, action, className = '', children }) {
  return (
    <section className={`enterprise-card overflow-hidden p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h2 className="text-[16px] font-bold leading-6 text-slate-950 dark:text-white">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
