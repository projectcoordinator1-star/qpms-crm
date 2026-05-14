export default function FormField({ label, value, multiline = false }) {
  const fieldClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium leading-5 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-qpms-300 focus:shadow-[0_0_0_4px_rgba(79,130,251,0.14)]';

  return (
    <label className="block">
      <span className="text-sm font-semibold leading-5 text-slate-700">{label}</span>
      {multiline ? (
        <textarea className={`${fieldClass} min-h-28 resize-none`} defaultValue={value} />
      ) : (
        <input className={fieldClass} defaultValue={value} />
      )}
    </label>
  );
}
