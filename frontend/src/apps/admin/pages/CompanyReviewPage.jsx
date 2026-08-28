import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";

export default function CompanyReviewPage() {
  const [status, setStatus] = useState("PENDING");
  return <div><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Application review</p><h1 className="mt-2 text-4xl font-black">ABC Landscaping</h1><p className="mt-1 text-slate-500">United States · Landscaper</p></div><Badge tone={status === "APPROVED" ? "success" : "warning"}>{status}</Badge></div><div className="mt-7 grid gap-5 lg:grid-cols-2"><Card className="p-6"><h2 className="text-lg font-bold">Company details</h2><dl className="mt-5 space-y-4 text-sm">{[["Legal name","ABC Landscaping LLC"],["Registration","US-REG-98213"],["Tax ID","US-TAX-88291"],["Business email","purchasing@example.com"]].map(([a,b]) => <div key={a} className="flex justify-between gap-5 border-b border-slate-100 pb-3"><dt className="text-slate-500">{a}</dt><dd className="font-semibold">{b}</dd></div>)}</dl></Card><Card className="p-6"><h2 className="text-lg font-bold">Documents</h2><div className="mt-5 space-y-3">{["Business registration","Tax certificate","Address proof"].map(x => <div key={x} className="flex justify-between rounded-xl bg-slate-50 p-4 text-sm font-semibold"><span>{x}</span><button className="text-emerald-700">View</button></div>)}</div><div className="mt-6 flex gap-3"><Button onClick={() => setStatus("APPROVED")}>Approve</Button><Button variant="danger" onClick={() => setStatus("REJECTED")}>Reject</Button></div></Card></div></div>;
}
