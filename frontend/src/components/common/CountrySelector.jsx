import { useRegion } from "../../context/RegionContext.jsx";

export default function CountrySelector() {
  const { country, setCountry, regions } = useRegion();

  return (
    <select
      value={country}
      onChange={e => setCountry(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
      aria-label="Country"
    >
      {Object.entries(regions).map(([code, r]) => (
        <option key={code} value={code}>{code} · {r.currency}</option>
      ))}
    </select>
  );
}
