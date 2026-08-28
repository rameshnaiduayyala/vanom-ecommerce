import { Link } from "react-router-dom";
import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";

export default function CompanyDashboardPage() {
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">B2B portal</p><h1 className="mt-2 text-4xl font-black">ABC Landscaping</h1><p className="mt-1 text-slate-500">United States · USD</p></div><Badge tone="success">APPROVED</Badge></div>
      <div className="mt-7 grid gap-4 md:grid-cols-4">{[["Account","Approved"],["Price list","Wholesale"],["Open orders","4"],["Quotes","2"]].map(([a,b]) => <Card key={a} className="p-5"><p className="text-sm text-slate-500">{a}</p><strong className="mt-2 block text-2xl">{b}</strong></Card>)}</div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <Link to="/b2b" className="rounded-2xl bg-white p-6 shadow-sm"><h3 className="font-bold">Wholesale catalog</h3><p className="mt-2 text-sm text-slate-500">Buy with MOQ and quantity tiers.</p></Link>
        <Link to="/quote/request" className="rounded-2xl bg-white p-6 shadow-sm"><h3 className="font-bold">Request a quote</h3><p className="mt-2 text-sm text-slate-500">Pallet, mixed-product and truckload quotes.</p></Link>
        <Link to="/b2b/orders" className="rounded-2xl bg-white p-6 shadow-sm"><h3 className="font-bold">Company orders</h3><p className="mt-2 text-sm text-slate-500">Track business purchases.</p></Link>
      </div>
    </div>
  );
}
