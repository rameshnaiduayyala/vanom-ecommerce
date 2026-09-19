import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Textarea, Select } from "@/components/ui/Input.jsx";
import { Layers, Plus, Trash2, Globe2 } from "lucide-react";
import { DEFAULT_BULK_FORM } from "./constants.js";

export function BulkProductFormModal({
  isOpen,
  onClose,
  initialData,
  categories = [],
  onSubmit,
  isPending,
}) {
  const [form, setForm] = useState(DEFAULT_BULK_FORM);
  const [activeCountryTab, setActiveCountryTab] = useState("US");

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Parse initialData countryPrices into form.countries
      const countryMap = JSON.parse(JSON.stringify(DEFAULT_BULK_FORM.countries));

      if (Array.isArray(initialData.countryPrices) && initialData.countryPrices.length > 0) {
        initialData.countryPrices.forEach((cp) => {
          const code = cp.countryCode?.toUpperCase();
          if (countryMap[code]) {
            countryMap[code] = {
              ...countryMap[code],
              moq: cp.moq || countryMap[code].moq,
              stock: cp.stock !== undefined ? cp.stock : countryMap[code].stock,
              isAvailable: cp.isAvailable !== undefined ? cp.isAvailable : true,
              basePrice: cp.tiers?.[0]?.price ? Number(cp.tiers[0].price) : countryMap[code].basePrice,
              tiers:
                Array.isArray(cp.tiers) && cp.tiers.length > 0
                  ? cp.tiers.map((t) => ({
                      minQuantity: t.minQuantity,
                      maxQuantity: t.maxQuantity ?? null,
                      price: Number(t.price),
                    }))
                  : countryMap[code].tiers,
            };
          }
        });
      }

      setForm({
        name: initialData.name || "",
        sku: initialData.sku || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId || (categories[0]?.id || ""),
        packagingType: initialData.packaging?.type || "25 KG Poly Sacks",
        unitsPerPackage: initialData.packaging?.unitsPerPackage || 1,
        packagesPerPallet: initialData.packaging?.packagesPerPallet || 40,
        leadTimeDays: initialData.leadTimeDays || 2,
        originCountry: initialData.originCountry || initialData.brand || "India",
        images:
          Array.isArray(initialData.images) && initialData.images.length > 0
            ? initialData.images
            : DEFAULT_BULK_FORM.images,
        countries: countryMap,
      });
    } else {
      setForm({
        ...DEFAULT_BULK_FORM,
        categoryId: categories[0]?.id || "",
      });
    }

    setActiveCountryTab("US");
  }, [isOpen, initialData, categories]);

  const handleCountryFieldChange = (countryCode, field, value) => {
    setForm((prev) => ({
      ...prev,
      countries: {
        ...prev.countries,
        [countryCode]: {
          ...prev.countries[countryCode],
          [field]: value,
        },
      },
    }));
  };

  const handleCountryTierChange = (countryCode, tierIdx, field, value) => {
    setForm((prev) => {
      const updatedTiers = [...prev.countries[countryCode].tiers];
      updatedTiers[tierIdx] = {
        ...updatedTiers[tierIdx],
        [field]: value,
      };
      return {
        ...prev,
        countries: {
          ...prev.countries,
          [countryCode]: {
            ...prev.countries[countryCode],
            tiers: updatedTiers,
          },
        },
      };
    });
  };

  const handleAddTier = (countryCode) => {
    setForm((prev) => {
      const currentTiers = prev.countries[countryCode].tiers;
      const lastTier = currentTiers[currentTiers.length - 1];
      const newMin = lastTier
        ? parseInt(lastTier.maxQuantity, 10) || parseInt(lastTier.minQuantity, 10) + 100
        : 100;
      const newPrice = lastTier ? Number((lastTier.price * 0.9).toFixed(2)) : 20.0;

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [countryCode]: {
            ...prev.countries[countryCode],
            tiers: [
              ...currentTiers,
              { minQuantity: newMin, maxQuantity: null, price: newPrice },
            ],
          },
        },
      };
    });
  };

  const handleRemoveTier = (countryCode, tierIdx) => {
    setForm((prev) => {
      const currentTiers = prev.countries[countryCode].tiers;
      if (currentTiers.length <= 1) return prev;
      return {
        ...prev,
        countries: {
          ...prev.countries,
          [countryCode]: {
            ...prev.countries[countryCode],
            tiers: currentTiers.filter((_, idx) => idx !== tierIdx),
          },
        },
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCatObj = categories.find((c) => c.id === form.categoryId);
    const categoryName = selectedCatObj?.name || "General";

    const countryPrices = Object.values(form.countries)
      .filter((c) => c.isAvailable)
      .map((c) => ({
        countryCode: c.countryCode,
        currencyCode: c.currencyCode,
        moq: parseInt(c.moq, 10) || 1,
        stock: parseInt(c.stock, 10) || 0,
        isAvailable: true,
        tiers: c.tiers.map((t) => ({
          minQuantity: parseInt(t.minQuantity, 10) || 1,
          maxQuantity: t.maxQuantity ? parseInt(t.maxQuantity, 10) : null,
          price: parseFloat(t.price) || 0,
        })),
      }));

    const usConfig = form.countries.US;
    const caConfig = form.countries.CA;
    const inConfig = form.countries.IN;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description?.trim() || null,
      category: categoryName,
      brand: form.originCountry || "Vanom Wholesale",
      type: "SIMPLE",
      isActive: true,
      countryPrices,
      packaging: {
        type: form.packagingType,
        unitsPerPackage: parseInt(form.unitsPerPackage, 10) || 1,
        packagesPerPallet: parseInt(form.packagesPerPallet, 10) || 40,
        palletCapacityUnits:
          (parseInt(form.unitsPerPackage, 10) || 1) *
          (parseInt(form.packagesPerPallet, 10) || 40),
      },
      moq: parseInt(usConfig.moq, 10) || 20,
      leadTimeDays: parseInt(form.leadTimeDays, 10) || 2,
      originCountry: form.originCountry,
      basePriceUSD: parseFloat(usConfig.basePrice || usConfig.tiers[0]?.price) || 25.0,
      basePriceCAD: parseFloat(caConfig.basePrice || caConfig.tiers[0]?.price) || 33.75,
      basePriceINR: parseFloat(inConfig.basePrice || inConfig.tiers[0]?.price) || 1800,
      stockQuantity:
        (parseInt(usConfig.stock, 10) || 0) +
        (parseInt(caConfig.stock, 10) || 0) +
        (parseInt(inConfig.stock, 10) || 0),
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? `Edit Bulk Product: ${initialData.name}`
          : "Create Dedicated B2B Wholesale Commodity"
      }
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Section 1: Basic Specifications */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] border-b border-border pb-1">
            1. Wholesale Commodity Identity & Category
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bulk Product Title"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Royal Heritage Aged Basmati Rice (25 KG Poly Sacks)"
              required
            />
            <Input
              label="Wholesale SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. BLK-RICE-25KG"
              required
            />
            <Select
              label="Master Category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              required
            />
            <Input
              label="Country of Origin"
              value={form.originCountry}
              onChange={(e) => setForm({ ...form, originCountry: e.target.value })}
              placeholder="e.g. India / USA"
            />
            <div className="md:col-span-2">
              <Textarea
                label="Wholesale Product Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter bulk packaging, purity certification, moisture specs..."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pallet & Packaging Logistics */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A] border-b border-border pb-1">
            2. Pallet, Packaging & Logistics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Packaging Type"
                value={form.packagingType}
                onChange={(e) => setForm({ ...form, packagingType: e.target.value })}
                placeholder="e.g. 25 KG Poly Sack / Master Carton"
                required
              />
            </div>
            <Input
              label="Default MOQ (Units)"
              type="number"
              min="1"
              value={form.countries.US.moq}
              onChange={(e) => handleCountryFieldChange("US", "moq", e.target.value)}
              required
            />
            <Input
              label="Lead Time (Days)"
              type="number"
              min="1"
              value={form.leadTimeDays}
              onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
            />
            <Input
              label="Units / Package"
              type="number"
              min="1"
              value={form.unitsPerPackage}
              onChange={(e) => setForm({ ...form, unitsPerPackage: e.target.value })}
            />
            <Input
              label="Packages / Pallet"
              type="number"
              min="1"
              value={form.packagesPerPallet}
              onChange={(e) => setForm({ ...form, packagesPerPallet: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Country-Wise Pricing, Warehouse Stock & Quantity Break Tiers */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#00875A]">
                3. Country-Wise Pricing, Stock & Volume Tiers
              </h4>
              <p className="text-[11px] text-text-muted">
                Configure country-specific availability, base pricing, warehouse stock, and wholesale tier breaks.
              </p>
            </div>

            {/* Country Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-xl border border-border">
              {Object.values(form.countries).map((c) => {
                const isActive = activeCountryTab === c.countryCode;
                return (
                  <button
                    key={c.countryCode}
                    type="button"
                    onClick={() => setActiveCountryTab(c.countryCode)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-emerald-800 shadow-xs border border-emerald-200"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <span className="text-sm">{c.flag}</span>
                    <span>{c.countryCode}</span>
                    <span className="text-[10px] opacity-75">({c.currencyCode})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Country Configuration Panel */}
          {(() => {
            const currentCountry = form.countries[activeCountryTab];
            if (!currentCountry) return null;

            return (
              <div className="p-4 rounded-xl border border-border bg-surface-muted/30 space-y-4">
                {/* Country Header & Availability Toggle */}
                <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentCountry.flag}</span>
                    <div>
                      <h5 className="font-bold text-xs text-text-primary">
                        {currentCountry.name} ({currentCountry.currencyCode})
                      </h5>
                      <p className="text-[10px] text-text-muted">
                        Market-specific MOQ, base unit price, and local warehouse availability
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-primary">
                    <span>Enable for {currentCountry.countryCode}</span>
                    <input
                      type="checkbox"
                      checked={currentCountry.isAvailable}
                      onChange={(e) =>
                        handleCountryFieldChange(activeCountryTab, "isAvailable", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-border text-[#00875A] focus:ring-[#00875A] cursor-pointer"
                    />
                  </label>
                </div>

                {currentCountry.isAvailable ? (
                  <>
                    {/* Base Country Parameters: MOQ, Stock, Base Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label={`Base Price (${currentCountry.currencySymbol} ${currentCountry.currencyCode})`}
                        type="number"
                        step="0.01"
                        value={currentCountry.basePrice}
                        onChange={(e) =>
                          handleCountryFieldChange(activeCountryTab, "basePrice", e.target.value)
                        }
                        required
                      />
                      <Input
                        label={`${currentCountry.countryCode} Warehouse Stock (Units)`}
                        type="number"
                        min="0"
                        value={currentCountry.stock}
                        onChange={(e) =>
                          handleCountryFieldChange(activeCountryTab, "stock", e.target.value)
                        }
                        required
                      />
                      <Input
                        label={`Market MOQ (${currentCountry.countryCode})`}
                        type="number"
                        min="1"
                        value={currentCountry.moq}
                        onChange={(e) =>
                          handleCountryFieldChange(activeCountryTab, "moq", e.target.value)
                        }
                        required
                      />
                    </div>

                    {/* Quantity Break Tiers Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h6 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#00875A]" />
                          Volume Tier Discount Breaks ({currentCountry.countryCode})
                        </h6>
                        <button
                          type="button"
                          onClick={() => handleAddTier(activeCountryTab)}
                          className="text-xs font-bold text-[#00875A] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Volume Tier
                        </button>
                      </div>

                      <div className="border border-border rounded-xl overflow-hidden bg-surface">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-surface-muted font-bold text-text-secondary border-b border-border">
                            <tr>
                              <th className="p-2.5">Tier Level</th>
                              <th className="p-2.5">Min Qty</th>
                              <th className="p-2.5">Max Qty (leave blank for unlimited +)</th>
                              <th className="p-2.5">Unit Price ({currentCountry.currencySymbol})</th>
                              <th className="p-2.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {currentCountry.tiers.map((t, idx) => (
                              <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                                <td className="p-2.5 font-bold text-text-primary">
                                  Tier #{idx + 1}
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="number"
                                    min="1"
                                    value={t.minQuantity}
                                    onChange={(e) =>
                                      handleCountryTierChange(
                                        activeCountryTab,
                                        idx,
                                        "minQuantity",
                                        e.target.value
                                      )
                                    }
                                    className="w-24 px-2 py-1 rounded border border-border text-xs bg-surface focus:outline-none focus:border-[#00875A]"
                                    required
                                  />
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited (+)"
                                    value={t.maxQuantity ?? ""}
                                    onChange={(e) =>
                                      handleCountryTierChange(
                                        activeCountryTab,
                                        idx,
                                        "maxQuantity",
                                        e.target.value ? parseInt(e.target.value, 10) : null
                                      )
                                    }
                                    className="w-32 px-2 py-1 rounded border border-border text-xs bg-surface focus:outline-none focus:border-[#00875A]"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <div className="relative w-28">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">
                                      {currentCountry.currencySymbol}
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={t.price}
                                      onChange={(e) =>
                                        handleCountryTierChange(
                                          activeCountryTab,
                                          idx,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      className="w-full pl-6 pr-2 py-1 rounded border border-border text-xs bg-surface font-mono font-bold focus:outline-none focus:border-[#00875A]"
                                      required
                                    />
                                  </div>
                                </td>
                                <td className="p-2.5 text-right">
                                  {currentCountry.tiers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTier(activeCountryTab, idx)}
                                      className="p-1 text-text-muted hover:text-red-600 rounded transition-colors cursor-pointer"
                                      title="Remove Tier"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-text-muted border border-dashed border-border rounded-xl">
                    <Globe2 className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-xs text-text-primary">
                      Product not active for {currentCountry.name}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Toggle &ldquo;Enable for {currentCountry.countryCode}&rdquo; above to configure
                      country pricing, stock, and tiers.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            className="font-bold cursor-pointer"
          >
            {initialData ? "Save Changes" : "Create Bulk Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
