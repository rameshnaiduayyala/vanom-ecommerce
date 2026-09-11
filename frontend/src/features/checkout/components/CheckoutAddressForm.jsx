import React from "react";
import { Truck } from "lucide-react";
import { Input } from "../../../components/ui/Input.jsx";
import { US_STATES, CA_PROVINCES } from "../../../constants/countries.js";

export function CheckoutAddressForm({ formData, setField, country }) {
  const regions = country.code === "CA" ? CA_PROVINCES : US_STATES;
  const regionLabel = country.code === "CA" ? "Province" : "State";
  const postalLabel = country.code === "CA" ? "Postal Code" : "ZIP Code";

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
          placeholder="123 Main St, Apt 4B"
          required
        />
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => setField("city", e.target.value)}
          required
        />

        {/* State / Province dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">{regionLabel}</label>
          <select
            value={formData.state}
            onChange={(e) => setField("state", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#185e3e] focus:ring-1 focus:ring-[#185e3e] bg-white"
            required
          >
            {regions.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>

        <Input
          label={postalLabel}
          value={formData.postalCode}
          onChange={(e) => setField("postalCode", e.target.value)}
          placeholder={country.code === "CA" ? "M5V 2T6" : "90001"}
          required
        />
      </div>
    </div>
  );
}
