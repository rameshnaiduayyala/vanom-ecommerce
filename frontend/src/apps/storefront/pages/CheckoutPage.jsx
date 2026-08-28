import { useRegion } from "../../../context/RegionContext.jsx";
import { products } from "../../../data/products.js";
import Button from "../../../components/ui/Button.jsx";
import { useState } from "react";

export default function CheckoutPage() {
  const { country, formatPrice } = useRegion();
  const [submitted, setSubmitted] = useState(false);
  const total = products[0].retail[country] * 2;

  if (submitted) return <div className="mx-auto max-w-2xl px-5 py-20 text-center"><div className="text-5xl">✓</div><h1 className="mt-4 text-4xl font-black">Order created</h1><p className="mt-2 text-slate-500">Demo checkout completed. Connect payment and order APIs for production.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Checkout</p>
      <h1 className="mt-2 text-4xl font-black">Complete your order</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Delivery</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="rounded-xl border border-slate-300 px-3 py-3" placeholder="Full name" />
            <input className="rounded-xl border border-slate-300 px-3 py-3" placeholder="Phone" />
            <input className="rounded-xl border border-slate-300 px-3 py-3 md:col-span-2" placeholder="Address" />
            <input className="rounded-xl border border-slate-300 px-3 py-3" placeholder="City" />
            <input className="rounded-xl border border-slate-300 px-3 py-3" placeholder="Postal code" />
          </div>
          <h2 className="mt-8 text-xl font-bold">Payment</h2>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">Payment provider placeholder. Use Stripe/Razorpay adapter in backend.</div>
        </div>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold">Order summary</h3>
          <div className="my-5 flex justify-between border-b border-slate-100 pb-4"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
          <p className="text-xs text-slate-500">Tax, shipping and final total are authoritative on the backend.</p>
          <Button onClick={() => setSubmitted(true)} className="mt-5 w-full">Place order</Button>
        </aside>
      </div>
    </div>
  );
}
