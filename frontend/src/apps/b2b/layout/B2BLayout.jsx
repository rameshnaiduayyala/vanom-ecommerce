import { Link, Outlet } from "react-router-dom";
import { Building2, Package, FileText, ShoppingBag } from "lucide-react";
import CountrySelector from "../../../components/common/CountrySelector.jsx";

export default function B2BLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">
          <Link to="/b2b" className="font-black">GreenMarket <span className="text-emerald-400">Business</span></Link>
          <nav className="hidden flex-1 gap-5 text-sm text-slate-300 md:flex">
            <Link to="/b2b">Catalog</Link><Link to="/b2b/orders">Orders</Link><Link to="/b2b/quotes">Quotes</Link><Link to="/company/dashboard">Company</Link>
          </nav>
          <CountrySelector />
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-5 py-8">
        <aside className="hidden w-56 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 md:block">
          <p className="px-3 pb-2 text-xs font-black uppercase tracking-wider text-slate-400">Business portal</p>
          {[
            ["/b2b", "Wholesale catalog", Package],
            ["/b2b/orders", "Company orders", ShoppingBag],
            ["/b2b/quotes", "Quotes", FileText],
            ["/company/dashboard", "Company", Building2]
          ].map(([to, label, Icon]) => <Link key={to} to={to} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-slate-100"><Icon size={17}/>{label}</Link>)}
        </aside>
        <main className="min-w-0 flex-1"><Outlet /></main>
      </div>
    </div>
  );
}
