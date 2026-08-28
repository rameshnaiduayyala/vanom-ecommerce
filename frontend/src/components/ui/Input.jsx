export default function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        {...props}
      />
    </label>
  );
}
