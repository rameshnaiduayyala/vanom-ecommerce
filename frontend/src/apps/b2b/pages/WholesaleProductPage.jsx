import { useParams } from "react-router-dom";
import { products } from "../../../data/products.js";
import { useRegion } from "../../../context/RegionContext.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";

export default function WholesaleProductPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === id) || products[0];
  const { country, formatPrice } = useRegion();
  const tiers = product.wholesale[country];

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid min-h-[420px] place-items-center rounded-3xl border border-slate-200 bg-white text-[9rem]">{product.image}</div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Wholesale</p>
          <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
          <p className="mt-3 text-slate-500">Sold by {product.unit}. MOQ: {product.moq} {product.unit.toLowerCase()}s.</p>
          <Card className="mt-6 overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4 font-bold">Quantity pricing</div>
            <div>{tiers.map(([min, max, price]) => <div key={min} className="flex justify-between border-b border-slate-100 px-5 py-4 last:border-0"><span>{min}{max ? ` - ${max}` : "+"} {product.unit.toLowerCase()}s</span><strong>{formatPrice(price)} / {product.unit}</strong></div>)}</div>
          </Card>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Add bulk order</Button>
            <Button to="/quote/request" variant="secondary">Request quote</Button>
          </div>
          <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm"><b>Packaging:</b> 1 pallet = {product.pallet} {product.unit.toLowerCase()}s.</div>
        </div>
      </div>
    </div>
  );
}
