import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";
export default function B2BOrdersPage() {
  const rows = [["#B2B-10422","12 Aug 2026","$8,420","PROCESSING"],["#B2B-10380","02 Aug 2026","$4,190","SHIPPED"],["#B2B-10311","25 Jul 2026","$2,890","DELIVERED"]];
  return <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Company</p><h1 className="mt-2 text-4xl font-black">Orders</h1><Card className="mt-7 overflow-hidden"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{rows.map(r => <tr key={r[0]} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><Badge tone="info">{r[3]}</Badge></td></tr>)}</tbody></table></Card></div>;
}
