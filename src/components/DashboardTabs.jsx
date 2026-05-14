export default function DashboardTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            'rounded-xl px-4 py-2.5 text-sm font-semibold leading-5 transition',
            activeTab === tab.id
              ? 'bg-qpms-600 text-white shadow-lg shadow-qpms-600/20'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
