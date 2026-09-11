import React, { useState, useEffect } from "react";
import { Building2, Edit2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export function CompanyFormModal({
  isOpen,
  onClose,
  editingCompany,
  onSubmit,
  isPending,
  formError,
  countries = [],
}) {
  const [formData, setFormData] = useState({
    legalName: "",
    businessName: "",
    registrationNumber: "",
    taxId: "",
    countryCode: "IN",
    status: "PENDING",
    paymentTermsDays: 30,
    creditLimit: 50000,

    // Address
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",

    // Admin User Credentials (Only for New Registration)
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
  });

  useEffect(() => {
    if (editingCompany) {
      const defaultAddress = editingCompany.addresses?.find((a) => a.isDefault) || editingCompany.addresses?.[0];
      setFormData({
        legalName: editingCompany.legalName || "",
        businessName: editingCompany.tradingName || editingCompany.legalName || "",
        registrationNumber: editingCompany.registrationNumber || "",
        taxId: editingCompany.taxId || "",
        countryCode: editingCompany.country?.code || "IN",
        status: editingCompany.status || "PENDING",
        paymentTermsDays: editingCompany.paymentTermsDays || 30,
        creditLimit: editingCompany.creditLimit || 50000,
        addressLine1: defaultAddress?.line1 || "",
        addressLine2: defaultAddress?.line2 || "",
        city: defaultAddress?.city || "",
        state: defaultAddress?.state || "",
        postalCode: defaultAddress?.postalCode || "",
        phone: defaultAddress?.phone || "",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminPassword: "",
        adminPhone: "",
      });
    } else {
      setFormData({
        legalName: "",
        businessName: "",
        registrationNumber: "",
        taxId: "",
        countryCode: "IN",
        status: "APPROVED",
        paymentTermsDays: 30,
        creditLimit: 50000,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminPassword: "Password123!",
        adminPhone: "",
      });
    }
  }, [editingCompany, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-[#F8FAF9] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00875A]" />
            <h3 className="font-bold text-base text-[#0F2B1C]">
              {editingCompany ? "Edit Corporate Entity" : "Register New Corporate Entity"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Business & Legal Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">
                Brand / Trading Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="Acme Wholesale"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">
                Legal Registered Name *
              </label>
              <input
                type="text"
                required
                value={formData.legalName}
                onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
                placeholder="Acme Wholesale Pvt Ltd"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
          </div>

          {/* Tax ID, Reg No, Country */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Tax ID / GSTIN</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
                placeholder="27ABCDE1234F1Z5"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Registration No</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                placeholder="CIN / Reg No"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Jurisdiction</label>
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, countryCode: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                {countries.length > 0 ? (
                  countries.map((c) => (
                    <option key={c.code || c.id} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="IN">India (IN)</option>
                    <option value="US">United States (US)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="GB">United Kingdom (GB)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Credit Terms & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Credit Limit</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData((prev) => ({ ...prev, creditLimit: Number(e.target.value) }))}
                placeholder="50000"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Payment Terms</label>
              <select
                value={formData.paymentTermsDays}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentTermsDays: Number(e.target.value) }))}
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value={0}>Immediate (Prepaid)</option>
                <option value={15}>NET 15 Days</option>
                <option value={30}>NET 30 Days</option>
                <option value={60}>NET 60 Days</option>
                <option value={90}>NET 90 Days</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Compliance Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="PENDING">PENDING</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Address Details */}
          <div className="pt-2 border-t border-border space-y-2">
            <h4 className="text-xs font-bold text-text-primary">Principal Business Address</h4>
            <div className="space-y-1">
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData((prev) => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="Address Line 1"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="City"
                className="w-full px-3 py-1.5 text-xs bg-surface-muted/50 border border-border rounded-lg text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="State"
                className="w-full px-3 py-1.5 text-xs bg-surface-muted/50 border border-border rounded-lg text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                placeholder="ZIP / Postal Code"
                className="w-full px-3 py-1.5 text-xs bg-surface-muted/50 border border-border rounded-lg text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
          </div>

          {/* Admin User Section (Only for New Registration) */}
          {!editingCompany && (
            <div className="pt-2 border-t border-border space-y-2.5">
              <h4 className="text-xs font-bold text-text-primary">Designate Company Administrator</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required={!editingCompany}
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminFirstName: e.target.value }))}
                  placeholder="Admin First Name"
                  className="w-full px-3 py-1.5 text-xs bg-surface-muted/50 border border-border rounded-lg text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
                />
                <input
                  type="text"
                  value={formData.adminLastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminLastName: e.target.value }))}
                  placeholder="Admin Last Name"
                  className="w-full px-3 py-1.5 text-xs bg-surface-muted/50 border border-border rounded-lg text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  required={!editingCompany}
                  value={formData.adminEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))}
                  placeholder="admin@company.com"
                  className="w-full px-3 py-1.5 text-xs bg-surface-muted/50 border border-border rounded-lg text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
                />
                <input
                  type="password"
                  required={!editingCompany}
                  value={formData.adminPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminPassword: e.target.value }))}
                  placeholder="Password"
                  className="w-full px-3 py-1.5 text-xs bg-surface-muted/50 border border-border rounded-lg text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#00875A] hover:bg-[#00734D] text-white font-bold text-xs shadow-sm"
            >
              {isPending ? "Saving..." : editingCompany ? "Save Changes" : "Register Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyFormModal;
