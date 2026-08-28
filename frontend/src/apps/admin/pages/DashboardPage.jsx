import Card from "../../../components/ui/Card.jsx";
export default function DashboardPage() {
  const stats = [["Today's orders","128"],["B2B applications","12"],["Pending quotes","8"],["Low stock SKUs","17"]];
  return <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Overview</p><h1 className="mt-2 text-4xl font-black">Commerce dashboard</h1><div className="mt-7 grid gap-4 md:grid-cols-4">{stats.map(([a,b]) => <Card key={a} className="p-5"><p className="text-sm text-slate-500">{a}</p><strong className="mt-2 block text-3xl">{b}</strong></Card>)}</div><Card className="mt-7 p-6"><h2 className="text-lg font-bold">Operational model</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Manage retail and wholesale commerce from one platform. Business applications, documents, pricing, inventory, orders, quotes, payments and reports remain separated by permissions.</p></Card></div>;
}
