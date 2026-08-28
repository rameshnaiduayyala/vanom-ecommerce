import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Package, Tags, Warehouse, ShoppingCart, BarChart3 } from "lucide-react";

const nav = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/business-applications", "Business Applications", Building2],
  ["/admin/customers", "Customers", Users],
  ["/admin/products", "Products", Package],
  ["/admin/pricing", "Pricing", Tags],
  ["/admin/inventory", "Inventory", Warehouse],
  ["/admin/orders", "Orders", ShoppingCart],
  ["/admin/reports", "Reports", BarChart3]
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-950 text-white lg:flex lg:flex-col">
        <Link to="/admin" className="border-b border-slate-800 px-6 py-5 text-lg font-black">GreenMarket Admin</Link>
        <nav className="flex-1 space-y-1 p-3">{nav.map(([to,label,Icon]) => <NavLink key={to} to={to} end={to === "/admin"} className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${isActive ? "bg-emerald-700 text-white" : "text-slate-300 hover:bg-slate-900"}`}><Icon size={18}/>{label}</NavLink>)}</nav>
        <div className="border-t border-slate-800 p-5 text-xs text-slate-500">Enterprise Operations</div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Admin</p><span className="font-bold">Commerce Operations</span></div><Link to="/" className="text-sm font-semibold text-emerald-700">Open storefront</Link></div></header>
        <main className="mx-auto max-w-7xl p-5 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
