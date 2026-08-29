import React from "react";
import { Input } from "../../../../components/ui/Input.jsx";

export function ProductTierPricingForm({ pricing, onChange }) {
  const handlePriceChange = (countryCode, field, value) => {
    onChange({
      ...pricing,
      [countryCode]: {
        ...pricing[countryCode],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 border-b border-border pb-1">
        2. Multi-Market Retail Prices & MOQ
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* India */}
        <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-3">
          <span className="text-xs font-bold text-text-primary block">🇮🇳 India (USD • $)</span>
          <Input
            label="Retail Price ($)"
            type="number"
            value={pricing?.IN?.retailPrice || 0}
            onChange={(e) => handlePriceChange("IN", "retailPrice", parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Wholesale MOQ (units)"
            type="number"
            value={pricing?.IN?.moq || 1}
            onChange={(e) => handlePriceChange("IN", "moq", parseInt(e.target.value, 10) || 1)}
            required
          />
        </div>

        {/* United States */}
        <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-3">
          <span className="text-xs font-bold text-text-primary block">🇺🇸 United States (USD • $)</span>
          <Input
            label="Retail Price ($)"
            type="number"
            step="0.01"
            value={pricing?.US?.retailPrice || 0}
            onChange={(e) => handlePriceChange("US", "retailPrice", parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Wholesale MOQ (units)"
            type="number"
            value={pricing?.US?.moq || 1}
            onChange={(e) => handlePriceChange("US", "moq", parseInt(e.target.value, 10) || 1)}
            required
          />
        </div>

        {/* United Kingdom */}
        <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-3">
          <span className="text-xs font-bold text-text-primary block">🇬🇧 United Kingdom (GBP • £)</span>
          <Input
            label="Retail Price (£)"
            type="number"
            step="0.01"
            value={pricing?.GB?.retailPrice || 0}
            onChange={(e) => handlePriceChange("GB", "retailPrice", parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Wholesale MOQ (units)"
            type="number"
            value={pricing?.GB?.moq || 1}
            onChange={(e) => handlePriceChange("GB", "moq", parseInt(e.target.value, 10) || 1)}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default ProductTierPricingForm;
