import React from "react";
import { Badge } from "../../../components/ui/Badge.jsx";

export function Pricing() {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Regional Wholesale Pricing Engine</h1>
        <p className="text-xs text-text-muted mt-1">Multi-currency wholesale margin tiers and quantity brackets across active trading markets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">India (USD • $)</h3>
            <Badge variant="brand" size="sm">Active Matrix</Badge>
          </div>
          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex justify-between py-1 border-b border-border">
              <span>Standard Retail Price</span>
              <strong className="text-text-primary">$2,499 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 units)</span>
              <strong className="text-gold-600 font-bold">$2,150 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 units)</span>
              <strong className="text-gold-600 font-bold">$1,950 / unit</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ units)</span>
              <strong className="text-gold-600 font-bold">$1,750 / unit</strong>
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
              <strong className="text-text-primary">$42.00 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 units)</span>
              <strong className="text-gold-600 font-bold">$35.00 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 units)</span>
              <strong className="text-gold-600 font-bold">$31.50 / unit</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ units)</span>
              <strong className="text-gold-600 font-bold">$28.00 / unit</strong>
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
              <strong className="text-text-primary">£34.00 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 1 (20 - 49 units)</span>
              <strong className="text-gold-600 font-bold">£28.50 / unit</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span>Tier 2 (50 - 99 units)</span>
              <strong className="text-gold-600 font-bold">£25.50 / unit</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Tier 3 (100+ units)</span>
              <strong className="text-gold-600 font-bold">£22.50 / unit</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
