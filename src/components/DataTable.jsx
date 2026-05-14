export default function DataTable({ columns, rows, embedded = false }) {
  return (
    <div
      className={[
        'overflow-hidden',
        embedded
          ? 'rounded-xl border border-slate-100 dark:border-slate-800'
          : 'rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_18px_55px_rgba(0,0,0,0.28)]',
      ].join(' ')}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/70">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 text-sm font-medium leading-6 text-slate-700 dark:text-slate-300 ${
                      column.wrap ? 'min-w-72 whitespace-normal' : 'whitespace-nowrap'
                    }`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
