import { products } from "../../../data/products.js";
import ProductCard from "../../../components/common/ProductCard.jsx";

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Catalog</p>
      <h1 className="mt-2 text-4xl font-black">All products</h1>
      <p className="mt-2 text-slate-500">Retail prices automatically use your selected country.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
