export default function DataTable({ columns, rows, embedded = false, onRowClick, highlightedRowId, emptyMessage = 'No records to show.' }) {
  return (
    <div
      className={[
        'overflow-hidden',
        embedded
          ? 'rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)] ring-1 ring-white/70 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5 dark:shadow-[0_18px_55px_rgba(0,0,0,0.28)]',
      ].join(' ')}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90 dark:bg-slate-800/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {rows.length ? rows.map((row) => (
              <tr
                key={row.id}
                data-row-id={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={(event) => {
                  if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onRowClick(row);
                  }
                }}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={`transition hover:bg-qpms-50/45 dark:hover:bg-slate-800/70 ${
                  onRowClick ? 'cursor-pointer focus-visible:bg-slate-50 focus-visible:outline-none dark:focus-visible:bg-slate-800/70' : ''
                } ${String(highlightedRowId) === String(row.id) ? 'new-row-highlight' : ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-3.5 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300 ${
                      column.wrap ? 'min-w-72 whitespace-normal' : 'whitespace-nowrap'
                    }`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center">
                  <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-400">
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
