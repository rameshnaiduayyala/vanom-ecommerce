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
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    contactPersonName: "",
    countryCode: "IN",
    taxRegistrationNumber: "",
    registrationNumber: "",
    address: "",
    status: "APPROVED",
  });

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        businessName: editingCompany.businessName || editingCompany.legalName || "",
        businessEmail: editingCompany.businessEmail || editingCompany.email || "",
        businessPhone: editingCompany.businessPhone || editingCompany.phone || "",
        contactPersonName: editingCompany.contactPersonName || "",
        countryCode: editingCompany.countryCode || editingCompany.country?.code || "IN",
        taxRegistrationNumber: editingCompany.taxRegistrationNumber || editingCompany.taxId || "",
        registrationNumber: editingCompany.registrationNumber || "",
        address: editingCompany.address || "",
        status: editingCompany.status || "APPROVED",
      });
    } else {
      setFormData({
        businessName: "",
        businessEmail: "",
        businessPhone: "",
        contactPersonName: "",
        countryCode: "IN",
        taxRegistrationNumber: "",
        registrationNumber: "",
        address: "",
        status: "APPROVED",
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
      <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-[#F8FAF9] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00875A]" />
            <h3 className="font-bold text-base text-[#0F2B1C]">
              {editingCompany ? "Edit Wholesale Business" : "Register New Wholesale Business"}
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

          {/* Business Name & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="Acme Wholesale Ltd"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={formData.contactPersonName}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPersonName: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
          </div>

          {/* Business Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">
                Business Email *
              </label>
              <input
                type="email"
                required
                value={formData.businessEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessEmail: e.target.value }))}
                placeholder="business@company.com"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">
                Business Phone *
              </label>
              <input
                type="text"
                required
                value={formData.businessPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessPhone: e.target.value }))}
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
          </div>

          {/* Tax ID, Reg No, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Tax ID / GSTIN / EIN</label>
              <input
                type="text"
                value={formData.taxRegistrationNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxRegistrationNumber: e.target.value }))}
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
              <label className="text-xs font-bold text-text-secondary block">Country Jurisdiction *</label>
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
                    <option value="AU">Australia (AU)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="FR">France (FR)</option>
                    <option value="AE">United Arab Emirates (AE)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary block">Business Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
            >
              <option value="APPROVED">APPROVED (Active Wholesale Access)</option>
              <option value="PENDING">PENDING (Review Application)</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* Principal Address */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-text-secondary block">
              Principal Business Address *
            </label>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Suite 400, 100 Main Street, New York, NY 10001"
              className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] resize-none"
            />
          </div>

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
              {isPending ? "Saving..." : editingCompany ? "Save Changes" : "Register Business"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyFormModal;
