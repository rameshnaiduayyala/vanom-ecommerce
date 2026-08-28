import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { Package, Plus, Search, Edit } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function Products() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => Api.admin.getProducts(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Master Product Catalog</h1>
          <p className="text-xs text-text-muted">Manage products, variants, packaging units, and stock allocation</p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-border overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Available Stock</th>
              <th className="p-4">Retail (IN / US / GB)</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                <td className="p-4 font-bold text-text-primary flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                  <span>{p.name}</span>
                </td>
                <td className="p-4 font-mono text-text-secondary">{p.sku}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 font-bold text-brand-700">{p.stock} units</td>
                <td className="p-4 font-semibold text-text-primary">
                  ₹{p.pricing?.IN?.retailPrice} • ${p.pricing?.US?.retailPrice} • £{p.pricing?.GB?.retailPrice}
                </td>
                <td className="p-4 text-right">
                  <Badge variant="green" size="sm">ACTIVE</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Regional Wholesale Pricing Engine</h1>
        <p className="text-xs text-text-muted">Manage quantity tiers and minimum order quantities (MOQ) across India, USA, and UK</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">India (INR • ₹)</h3>
            <Badge variant="brand" size="sm">Active Matrix</Badge>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-border">
              <span>Standard Retail Price</span>
              <strong className="text-text-primary">₹499 / sack</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 sacks)</span>
              <strong className="text-gold-600 font-bold">₹420 / sack</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 sacks)</span>
              <strong className="text-gold-600 font-bold">₹390 / sack</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ sacks)</span>
              <strong className="text-gold-600 font-bold">₹350 / sack</strong>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">United States (USD • $)</h3>
            <Badge variant="brand" size="sm">Active Matrix</Badge>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-border">
              <span>Standard Retail Price</span>
              <strong className="text-text-primary">$19.99 / sack</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 sacks)</span>
              <strong className="text-gold-600 font-bold">$16.50 / sack</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 sacks)</span>
              <strong className="text-gold-600 font-bold">$14.90 / sack</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ sacks)</span>
              <strong className="text-gold-600 font-bold">$13.50 / sack</strong>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">United Kingdom (GBP • £)</h3>
            <Badge variant="brand" size="sm">Active Matrix</Badge>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-border">
              <span>Standard Retail Price</span>
              <strong className="text-text-primary">£17.99 / sack</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 sacks)</span>
              <strong className="text-gold-600 font-bold">£14.90 / sack</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 sacks)</span>
              <strong className="text-gold-600 font-bold">£13.40 / sack</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ sacks)</span>
              <strong className="text-gold-600 font-bold">£12.20 / sack</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
