import { Link, Outlet } from "react-router-dom";
import { ShoppingCart, UserRound, Search } from "lucide-react";
import CountrySelector from "../../../components/common/CountrySelector.jsx";

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">
          <Link to="/" className="text-xl font-black tracking-tight text-emerald-800">GreenMarket</Link>
          <div className="hidden flex-1 items-center rounded-xl border border-slate-300 bg-slate-50 px-3 md:flex">
            <Search size={18} className="text-slate-400" />
            <input className="w-full bg-transparent px-2 py-2 outline-none" placeholder="Search plants, soil, pots..." />
          </div>
          <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
            <Link to="/products">Shop</Link>
            <Link to="/b2b">Bulk buying</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <CountrySelector />
            <Link className="rounded-lg p-2 hover:bg-slate-100" to="/cart" aria-label="Cart"><ShoppingCart size={20}/></Link>
            <Link className="rounded-lg p-2 hover:bg-slate-100" to="/account" aria-label="Account"><UserRound size={20}/></Link>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 text-sm text-slate-500">
          GreenMarket Commerce · Retail + Wholesale
        </div>
      </footer>
    </div>
  );
}
