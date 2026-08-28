import { Link } from "react-router-dom";
import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";

const rows = [
  ["ABC Landscaping", "US", "TAX-•••8291", "PENDING"],
  ["GreenBuild Supplies", "GB", "VAT-•••1042", "UNDER_REVIEW"],
  ["Urban Garden Co", "IN", "GST-•••7712", "PENDING"]
];

export default function BusinessApplicationsPage() {
  return <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">B2B verification</p><h1 className="mt-2 text-4xl font-black">Business applications</h1><Card className="mt-7 overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Company</th><th>Country</th><th>Tax ID</th><th>Status</th><th className="pr-5">Action</th></tr></thead><tbody>{rows.map(r => <tr key={r[0]} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><Badge tone={r[3] === "PENDING" ? "warning" : "info"}>{r[3]}</Badge></td><td className="pr-5"><Link to="/admin/companies/1" className="font-semibold text-emerald-700">Review</Link></td></tr>)}</tbody></table></div></Card></div>;
}
