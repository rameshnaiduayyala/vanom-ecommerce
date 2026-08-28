import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";

export default function QuoteRequestPage() {
  const [done, setDone] = useState(false);
  if (done) return <div className="rounded-3xl bg-white p-10 text-center"><h1 className="text-3xl font-black">Quote request received</h1><p className="mt-2 text-slate-500">Sales team will review your request.</p></div>;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-7 shadow-sm md:p-10">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Bulk quote</p>
      <h1 className="mt-2 text-4xl font-black">Request a custom quote</h1>
      <div className="mt-7 space-y-4">
        <select className="w-full rounded-xl border border-slate-300 px-3 py-3"><option>Premium Garden Soil</option><option>Premium Ceramic Pot</option><option>Indoor Foliage Plant</option></select>
        <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Quantity" />
        <select className="w-full rounded-xl border border-slate-300 px-3 py-3"><option>Sacks</option><option>Pallets</option><option>Truckload</option></select>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Delivery location" />
        <textarea rows="5" className="w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Requirements / notes" />
      </div>
      <Button onClick={() => setDone(true)} className="mt-6">Submit quote request</Button>
    </div>
  );
}
