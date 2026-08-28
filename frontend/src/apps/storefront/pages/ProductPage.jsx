import { useParams, Link } from "react-router-dom";
import { products } from "../../../data/products.js";
import { useRegion } from "../../../context/RegionContext.jsx";
import Button from "../../../components/ui/Button.jsx";

export default function ProductPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === id) || products[0];
  const { country, formatPrice } = useRegion();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="grid min-h-[450px] place-items-center rounded-3xl border border-slate-200 bg-white text-[10rem]">{product.image}</div>
        <div className="py-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">{product.category}</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">{product.name}</h1>
          <p className="mt-5 text-lg text-slate-600">{product.description}</p>
          <div className="mt-7 text-4xl font-black">{formatPrice(product.retail[country])}</div>
          <div className="mt-6 flex gap-3">
            <Button>Add to cart</Button>
            <Button to={`/b2b/product/${product.id}`} variant="secondary">See wholesale pricing</Button>
          </div>
          <Link className="mt-5 inline-block text-sm font-semibold text-emerald-700" to="/cart">Go to cart →</Link>
        </div>
      </div>
    </div>
  );
}
