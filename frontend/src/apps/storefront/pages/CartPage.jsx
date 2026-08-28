import { Link } from "react-router-dom";
import { products } from "../../../data/products.js";
import { useRegion } from "../../../context/RegionContext.jsx";
import Button from "../../../components/ui/Button.jsx";

export default function CartPage() {
  const { country, formatPrice } = useRegion();
  const p = products[0];
  const quantity = 2;
  const total = p.retail[country] * quantity;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Shopping</p>
      <h1 className="mt-2 text-4xl font-black">Your cart</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-slate-100 text-3xl">{p.image}</div>
            <div className="flex-1"><h3 className="font-bold">{p.name}</h3><p className="text-sm text-slate-500">{quantity} × {formatPrice(p.retail[country])}</p></div>
            <strong>{formatPrice(total)}</strong>
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold">Summary</h3>
          <div className="my-5 flex justify-between border-b border-slate-100 pb-4"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
          <p className="text-xs text-slate-500">Tax and shipping are calculated server-side.</p>
          <Button to="/checkout" className="mt-5 w-full">Checkout</Button>
        </aside>
      </div>
    </div>
  );
}
