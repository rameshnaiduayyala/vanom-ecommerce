import { useCountryStore } from "../../stores/country.store.js";
import { SUPPORTED_COUNTRIES } from "../../constants/countries.js";

export default function CountrySelector() {
  const { country, setCountryByCode } = useCountryStore();

  return (
    <select
      value={country?.code || "US"}
      onChange={(e) => setCountryByCode(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
      aria-label="Country"
    >
      {SUPPORTED_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.name} ({c.currency} · {c.symbol})
        </option>
      ))}
    </select>
  );
}

