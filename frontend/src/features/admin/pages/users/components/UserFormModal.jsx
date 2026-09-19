import React, { useState, useEffect } from "react";
import { User, UserPlus, Edit2, X, Globe, ShieldCheck, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "../../../../../components/ui/Button.jsx";
import { Api } from "@/services/api/api-client.js";

export function UserFormModal({
  isOpen,
  onClose,
  editingUser,
  onSubmit,
  isPending,
  formError,
}) {
  const [countries, setCountries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [accountType, setAccountType] = useState("RETAIL"); // "RETAIL" | "B2B"
  const [b2bMode, setB2bMode] = useState("EXISTING"); // "EXISTING" | "NEW"

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
    isActive: true,
    countryId: "",

    // Selected Existing Business
    businessId: "",

    // New Business details
    businessName: "",
    taxRegistrationNumber: "",
    registrationNumber: "",
    address: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [cList, bList] = await Promise.all([
          Api.geography.getCountries(),
          Api.admin.getCompanies(),
        ]);
        if (isMounted) {
          setCountries(cList || []);
          setCompanies(bList || []);
        }
      } catch (e) {
        console.error("Failed to load countries or businesses in UserFormModal:", e);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingUser) {
      const isB2B = Boolean(editingUser.bulkBusiness);
      setAccountType(isB2B ? "B2B" : "RETAIL");
      setB2bMode("EXISTING");
      setFormData({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        password: "",
        phone: editingUser.phone || editingUser.bulkBusiness?.businessPhone || "",
        role: editingUser.role || "USER",
        isActive: editingUser.isActive ?? true,
        countryId: editingUser.countryId || editingUser.country?.id || "",
        businessId: editingUser.bulkBusiness?.id || companies[0]?.id || "",
        businessName: editingUser.bulkBusiness?.businessName || "",
        taxRegistrationNumber: editingUser.bulkBusiness?.taxRegistrationNumber || "",
        registrationNumber: editingUser.bulkBusiness?.registrationNumber || "",
        address: editingUser.bulkBusiness?.address || "",
      });
    } else {
      setAccountType("RETAIL");
      setB2bMode("EXISTING");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "USER",
        isActive: true,
        countryId: countries[0]?.id || "",
        businessId: companies[0]?.id || "",
        businessName: "",
        taxRegistrationNumber: "",
        registrationNumber: "",
        address: "",
      });
    }
  }, [editingUser, countries, companies, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      isActive: formData.isActive,
      countryId: formData.countryId || null,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    if (accountType === "B2B") {
      if (b2bMode === "EXISTING" && formData.businessId) {
        payload.businessId = formData.businessId;
      } else {
        payload.businessName = formData.businessName || `${formData.firstName}'s Wholesale Trading`;
        payload.business = {
          businessName: formData.businessName,
          businessEmail: formData.email,
          businessPhone: formData.phone || "—",
          taxRegistrationNumber: formData.taxRegistrationNumber,
          registrationNumber: formData.registrationNumber,
          address: formData.address || "Principal Business Address",
          status: "APPROVED",
        };
      }
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-[#F8FAF9] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {editingUser ? (
              <Edit2 className="w-5 h-5 text-[#00875A]" />
            ) : (
              <UserPlus className="w-5 h-5 text-[#00875A]" />
            )}
            <h3 className="font-bold text-base text-[#0F2B1C]">
              {editingUser ? "Edit User Details" : "Add New User Account"}
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

          {/* Account Category Switcher: Standard Retail vs B2B Wholesale */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary block">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType("RETAIL")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${accountType === "RETAIL"
                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                    : "bg-surface-muted/50 border-border text-text-secondary hover:bg-white"
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                Standard Retail User
              </button>

              <button
                type="button"
                onClick={() => setAccountType("B2B")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${accountType === "B2B"
                    ? "bg-amber-50 border-amber-500 text-amber-800 shadow-2xs"
                    : "bg-surface-muted/50 border-border text-text-secondary hover:bg-white"
                  }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                B2B Wholesale Business
              </button>
            </div>
          </div>

          {/* B2B Business Options (if B2B chosen) */}
          {accountType === "B2B" && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span>Business Affiliation</span>
                </div>
                {!editingUser && (
                  <div className="flex rounded-lg bg-amber-100 p-0.5 border border-amber-300 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setB2bMode("EXISTING")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${b2bMode === "EXISTING"
                          ? "bg-white text-amber-950 font-bold shadow-2xs"
                          : "text-amber-800 hover:text-amber-950"
                        }`}
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setB2bMode("NEW")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${b2bMode === "NEW"
                          ? "bg-white text-amber-950 font-bold shadow-2xs"
                          : "text-amber-800 hover:text-amber-950"
                        }`}
                    >
                      Create New
                    </button>
                  </div>
                )}
              </div>

              {b2bMode === "EXISTING" ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-900 block">
                    Select Registered Business *
                  </label>
                  {companies.length === 0 ? (
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-800">
                      No registered businesses found. Please switch to "Create New" above.
                    </div>
                  ) : (
                    <select
                      value={formData.businessId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, businessId: e.target.value }))}
                      className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl text-text-primary focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.businessName || c.legalName} ({c.countryCode || "US"}) - {c.status || "APPROVED"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-900 block">
                      Company / Legal Business Name *
                    </label>
                    <input
                      type="text"
                      required={accountType === "B2B" && b2bMode === "NEW"}
                      value={formData.businessName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                      placeholder="e.g. Acme Organic Imports LLC"
                      className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl text-text-primary focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase block">
                        Tax ID / GSTIN
                      </label>
                      <input
                        type="text"
                        value={formData.taxRegistrationNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, taxRegistrationNumber: e.target.value }))}
                        placeholder="US-EIN / GSTIN"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase block">
                        Registration No
                      </label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                        placeholder="CIN / Corp Reg #"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-900 uppercase block">
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Suite, Street address, City"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary block">Email Address</label>
            <input
              type="email"
              required
              disabled={!!editingUser}
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              className={`w-full px-3 py-2 text-xs border border-border rounded-xl text-text-primary focus:outline-none ${editingUser
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "bg-surface-muted/50 focus:bg-white focus:border-[#00875A]"
                }`}
            />
          </div>

          {/* Password & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">
                {editingUser ? "New Password" : "Password *"}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555 123 4567"
                className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
              />
            </div>
          </div>

          {/* Country Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary block flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00875A]" />
              Assigned Region / Country
            </label>
            <select
              value={formData.countryId}
              onChange={(e) => setFormData((prev) => ({ ...prev, countryId: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
            >
              <option value="">None / Global</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - {c.currency?.code || "Default"}
                </option>
              ))}
            </select>
          </div>

          {/* Role and Status Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00875A]" />
                System Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="USER">USER {accountType === "B2B" ? "(Wholesale Buyer)" : "(Customer)"}</option>
                <option value="SUPERADMIN">SUPERADMIN (System Administrator)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00875A]" />
                Account Status
              </label>
              <select
                value={formData.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "ACTIVE",
                  }))
                }
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#00875A] hover:bg-[#00734D] text-white font-bold text-xs shadow-sm"
            >
              {isPending ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;
