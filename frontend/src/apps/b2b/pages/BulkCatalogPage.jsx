import { products } from "../../../data/products.js";
import ProductCard from "../../../components/common/ProductCard.jsx";
import Button from "../../../components/ui/Button.jsx";

export default function BulkCatalogPage() {
  return (
    <div>
      <section className="rounded-3xl bg-emerald-900 p-8 text-white md:p-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Wholesale marketplace</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Buy at business volume.</h1>
        <p className="mt-3 max-w-2xl text-emerald-100">Quantity tiers, MOQ, pallets and company-specific pricing in one business portal.</p>
        <Button to="/quote/request" variant="secondary" className="mt-5">Request a quote</Button>
      </section>
      <div className="mt-8 flex items-end justify-between"><div><h2 className="text-2xl font-black">Wholesale catalog</h2><p className="text-sm text-slate-500">Pricing changes by country and quantity.</p></div></div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{products.map(p => <ProductCard key={p.id} product={p} b2b />)}</div>
    </div>
  );
}
