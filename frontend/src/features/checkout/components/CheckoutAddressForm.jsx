import React from "react";
import { Truck, Info } from "lucide-react";
import { Input } from "../../../components/ui/Input.jsx";
import { US_STATES, CA_PROVINCES, IN_STATES } from "../../../constants/countries.js";

export function CheckoutAddressForm({
  formData,
  setField,
  country,
  addressValidation = null,
  onApplyNormalizedAddress = null
}) {
  const regions = country.code === "CA" ? CA_PROVINCES : country.code === "IN" ? IN_STATES : US_STATES;
  const regionLabel = country.code === "CA" ? "Province" : "State";
  const postalLabel = country.code === "CA" ? "Postal Code" : country.code === "IN" ? "PIN Code" : "ZIP Code";
  const postalPlaceholder = country.code === "CA" ? "M5V 2T6" : country.code === "IN" ? "400001" : "e.g. 94117";
  const cityPlaceholder = country.code === "CA" ? "e.g. Toronto" : country.code === "IN" ? "e.g. Mumbai" : "e.g. San Francisco";

  const isAddressComplete = !!(formData.addressLine1?.trim() && formData.city?.trim() && formData.postalCode?.trim() && formData.state?.trim());

  const hasSuggestedCorrection =
    addressValidation?.isValid &&
    addressValidation?.normalizedAddress &&
    (addressValidation.normalizedAddress.postalCode !== formData.postalCode ||
      addressValidation.normalizedAddress.city?.toLowerCase() !== formData.city?.toLowerCase() ||
      addressValidation.normalizedAddress.addressLine1?.toLowerCase() !== formData.addressLine1?.toLowerCase());

  return (
    <div className="p-6 rounded-2xl bg-white border border-border shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-[#185e3e]/10 flex items-center justify-center">
          <Truck className="w-4 h-4 text-[#185e3e]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Delivery Address
          </h3>
          <p className="text-[11px] text-gray-500">{country.flag} Shipping to {country.name}</p>
        </div>
      </div>

      {/* Suggested USPS / Postal Standardization Banner */}
      {hasSuggestedCorrection && onApplyNormalizedAddress && (
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 animate-in fade-in">
          <div className="space-y-1">
            <p className="font-bold text-blue-950 flex items-center gap-1.5">
              <span>Standardized Postal Address Available</span>
            </p>
            <p className="text-blue-800 text-[11px]">
              Shippo matched your address to:{" "}
              <strong>
                {addressValidation.normalizedAddress.addressLine1},{" "}
                {addressValidation.normalizedAddress.city},{" "}
                {addressValidation.normalizedAddress.state}{" "}
                {addressValidation.normalizedAddress.postalCode}
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onApplyNormalizedAddress}
            className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shrink-0 transition-colors shadow-2xs"
          >
            Use Suggested
          </button>
        </div>
      )}

      {/* Invalid Address Warning Banner from Shippo */}
      {addressValidation && !addressValidation.isValid && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 animate-in fade-in">
          <span className="text-rose-600 font-bold text-base leading-none">⚠️</span>
          <div className="space-y-1">
            <p className="font-bold text-rose-950">Invalid Delivery Address Detected</p>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              {addressValidation.messages?.[0]?.text ||
                addressValidation.message ||
                `The street, city, state, or ${postalLabel} do not match official postal records. Please verify for accurate delivery and taxes.`}
            </p>
          </div>
        </div>
      )}

      {/* Address completeness hint */}
      {!isAddressComplete && !addressValidation && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            Fill in your <strong>street address, city, and {postalLabel}</strong> — they must all match each other for accurate live shipping rates and tax calculation.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          placeholder="John Doe"
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="john@example.com"
          required
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setField("phone", e.target.value)}
          placeholder={country.code === "CA" ? "+1 416 000 0000" : "+1 213 000 0000"}
          required
        />
        <Input
          label="Street Address / Building"
          value={formData.addressLine1}
          onChange={(e) => setField("addressLine1", e.target.value)}
          placeholder="e.g. 215 Clayton St"
          required
        />
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => setField("city", e.target.value)}
          placeholder={cityPlaceholder}
          required
        />

        {/* State / Province dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            {regionLabel} <span className="text-red-500">*</span>
          </label>
          {(() => {
            const rawState = (formData.state || "").trim();
            const matchedRegion = regions.find(
              (r) =>
                r.code.toUpperCase() === rawState.toUpperCase() ||
                r.name.toLowerCase() === rawState.toLowerCase()
            );
            const selectedVal = matchedRegion ? matchedRegion.code : rawState;

            return (
              <select
                value={selectedVal}
                onChange={(e) => setField("state", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#185e3e] focus:ring-1 focus:ring-[#185e3e] bg-white font-medium text-gray-900"
                required
              >
                <option value="">— Select {regionLabel} —</option>
                {selectedVal && !regions.some((r) => r.code === selectedVal) && (
                  <option value={selectedVal}>{selectedVal}</option>
                )}
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            );
          })()}
        </div>

        <Input
          label={postalLabel}
          value={formData.postalCode}
          onChange={(e) => setField("postalCode", e.target.value)}
          placeholder={postalPlaceholder}
          required
        />
      </div>
    </div>
  );
}
