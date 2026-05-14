export default function ChartCard({ title, description, action, className = '', children }) {
  return (
    <section className={`enterprise-card p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold leading-6 text-slate-950 dark:text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm font-normal leading-6 text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
