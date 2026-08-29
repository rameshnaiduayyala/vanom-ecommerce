import React from "react";
import { Modal } from "../../../../components/ui/Modal.jsx";
import { Badge } from "../../../../components/ui/Badge.jsx";

export function ProductViewModal({ product, onClose }) {
  if (!product) return null;

  return (
    <Modal
      isOpen={!!product}
      onClose={onClose}
      title="Product Inspection & Logistics Dossier"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs text-text-primary">
        <div className="flex gap-4 items-start">
          <img
            src={product.image}
            alt={product.name}
            className="w-24 h-24 rounded-xl object-cover border border-border shrink-0"
          />
          <div className="space-y-1">
            <Badge variant="brand" size="sm">
              {product.category}
            </Badge>
            <h3 className="text-base font-bold text-text-primary">{product.name}</h3>
            <p className="text-text-muted font-mono">SKU: {product.sku}</p>
            <p className="text-text-secondary leading-relaxed pt-1">{product.description}</p>
          </div>
        </div>

        {/* Packaging & Logistics Box */}
        <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-2">
          <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
            Logistics & Pallet Specifications
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-text-muted block text-[10px]">Packaging</span>
              <span className="font-semibold">{product.packaging?.unitName}</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px]">Unit Weight</span>
              <span className="font-semibold">{product.packaging?.weightKg} KG</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px]">Units / Pallet</span>
              <span className="font-bold text-brand-700">{product.packaging?.palletQuantity} Units</span>
            </div>
            <div>
              <span className="text-text-muted block text-[10px]">Stock Available</span>
              <span className="font-bold text-emerald-700">{product.stock}</span>
            </div>
          </div>
        </div>

        {/* Wholesale Price Tiers */}
        <div className="space-y-2">
          <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
            Regional Wholesale Tier Pricing
          </h5>
          <div className="border border-border rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-surface-muted text-[11px] uppercase font-semibold">
                <tr>
                  <th className="p-3">Country</th>
                  <th className="p-3">Retail Price</th>
                  <th className="p-3">Wholesale MOQ</th>
                  <th className="p-3">Tier 3 (Max Volume)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-semibold">India (USD)</td>
                  <td className="p-3 font-bold text-text-primary">${product.pricing?.IN?.retailPrice}</td>
                  <td className="p-3 font-mono">{product.pricing?.IN?.moq || 20}</td>
                  <td className="p-3 font-bold text-gold-600">${product.pricing?.IN?.wholesaleTiers?.[2]?.unitPrice || 1750}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">United States (USD)</td>
                  <td className="p-3 font-bold text-text-primary">${product.pricing?.US?.retailPrice}</td>
                  <td className="p-3 font-mono">{product.pricing?.US?.moq || 20}</td>
                  <td className="p-3 font-bold text-gold-600">${product.pricing?.US?.wholesaleTiers?.[2]?.unitPrice || 28.0}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">United Kingdom (GBP)</td>
                  <td className="p-3 font-bold text-text-primary">£{product.pricing?.GB?.retailPrice}</td>
                  <td className="p-3 font-mono">{product.pricing?.GB?.moq || 20}</td>
                  <td className="p-3 font-bold text-gold-600">£{product.pricing?.GB?.wholesaleTiers?.[2]?.unitPrice || 22.5}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ProductViewModal;
