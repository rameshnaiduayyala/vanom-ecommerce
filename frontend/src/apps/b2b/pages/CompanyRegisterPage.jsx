import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";

export default function CompanyRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return <div className="rounded-3xl bg-white p-10 text-center shadow-sm"><div className="text-5xl">✓</div><h1 className="mt-4 text-3xl font-black">Application submitted</h1><p className="mt-2 text-slate-500">Your company is pending admin verification.</p></div>;

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">B2B registration</p>
      <h1 className="mt-2 text-4xl font-black">Register your company</h1>
      <p className="mt-3 text-slate-500">Submit legal details and business documents. Admin approval unlocks wholesale pricing.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Input label="Legal business name" placeholder="ABC Landscaping LLC" />
        <Input label="Trading name" placeholder="ABC Landscaping" />
        <Input label="Registration number" placeholder="REG-12345" />
        <Input label="Tax / VAT / GST ID" placeholder="TAX-12345" />
        <Input label="Business email" placeholder="purchasing@company.com" />
        <Input label="Contact person" placeholder="Purchasing Manager" />
      </div>
      <div className="mt-6 space-y-4">
        {["Business registration document", "Tax certificate", "Address proof"].map(label => <label key={label} className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 p-4 text-sm font-semibold"><span>{label}</span><input type="file" /></label>)}
      </div>
      <Button onClick={() => setSubmitted(true)} className="mt-7">Submit for admin review</Button>
    </div>
  );
}
