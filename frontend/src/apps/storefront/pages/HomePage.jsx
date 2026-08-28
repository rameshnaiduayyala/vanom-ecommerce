import { Link } from "react-router-dom";
import { products } from "../../../data/products.js";
import { useRegion } from "../../../context/RegionContext.jsx";
import ProductCard from "../../../components/common/ProductCard.jsx";
import Button from "../../../components/ui/Button.jsx";

export default function HomePage() {
  const { region } = useRegion();
  return (
    <div>
      <section className="bg-emerald-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Retail marketplace</p>
            <h1 className="mt-4 text-5xl font-black leading-[.98] tracking-tight md:text-7xl">Everything you need to grow.</h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">Plants, pots, soil and gardening supplies delivered across your region.</p>
            <div className="mt-7 flex gap-3">
              <Button to="/products">Shop products</Button>
              <Button to="/b2b" variant="secondary">Buy in bulk</Button>
            </div>
          </div>
          <div className="grid h-72 place-items-center rounded-3xl border border-emerald-100 bg-white text-8xl shadow-sm">🌿 🪴 🌱</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Popular</p><h2 className="text-3xl font-black">Shop in {region.name}</h2></div>
          <Link to="/products" className="font-semibold text-emerald-700">View all</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="mx-auto mb-10 max-w-7xl px-5">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-slate-900 p-8 text-white md:flex-row md:items-center">
          <div><p className="text-xs font-black uppercase tracking-wider text-slate-400">For businesses</p><h2 className="mt-2 text-3xl font-black">Buy by sacks, boxes and pallets.</h2><p className="mt-2 max-w-2xl text-slate-300">Register your company to unlock wholesale prices, MOQs, quantity tiers and bulk quotes.</p></div>
          <Button to="/company/register" variant="secondary">Create business account</Button>
        </div>
      </section>
    </div>
  );
}
