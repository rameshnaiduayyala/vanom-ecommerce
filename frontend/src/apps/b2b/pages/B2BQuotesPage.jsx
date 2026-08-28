import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";
export default function B2BQuotesPage() {
  return <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Commercial</p><h1 className="mt-2 text-4xl font-black">Quotes</h1><div className="mt-7 grid gap-4 md:grid-cols-2"><Card className="p-5"><p className="text-xs text-slate-500">QT-3021</p><h3 className="mt-2 font-bold">5 pallets Premium Garden Soil</h3><div className="mt-4"><Badge tone="warning">AWAITING RESPONSE</Badge></div></Card><Card className="p-5"><p className="text-xs text-slate-500">QT-3012</p><h3 className="mt-2 font-bold">500 Ceramic Pots</h3><div className="mt-4"><Badge tone="success">QUOTED</Badge></div></Card></div></div>;
}
