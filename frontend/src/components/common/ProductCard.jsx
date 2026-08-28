import { Link } from "react-router-dom";
import { useRegion } from "../../context/RegionContext.jsx";
import Button from "../ui/Button.jsx";

export default function ProductCard({ product, b2b = false }) {
  const { country, formatPrice } = useRegion();
  const first = product.wholesale[country]?.[0];
  const price = b2b ? first?.[2] : product.retail[country];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid h-52 place-items-center bg-slate-100 text-7xl">{product.image}</div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{product.category}</span>
        <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-auto pt-2">
          <div className="text-xl font-extrabold">{formatPrice(price)}</div>
          <div className="text-xs text-slate-500">
            {b2b ? `From · MOQ ${product.moq} ${product.unit.toLowerCase()}s` : "Retail price"}
          </div>
        </div>
        <Button to={b2b ? `/b2b/product/${product.id}` : `/product/${product.id}`} variant={b2b ? "dark" : "primary"}>
          {b2b ? "View wholesale" : "View product"}
        </Button>
      </div>
    </article>
  );
}
