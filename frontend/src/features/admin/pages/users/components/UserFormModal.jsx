import React, { useState, useEffect } from "react";
import { User, UserPlus, Edit2, X, Building2, AlertCircle } from "lucide-react";
import { Button } from "../../../../../components/ui/Button.jsx";

export function UserFormModal({
  isOpen,
  onClose,
  editingUser,
  onSubmit,
  isPending,
  formError,
  companies = [],
}) {
  const [b2bCompanyMode, setB2bCompanyMode] = useState("EXISTING");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    customerType: "B2C",
    role: "CUSTOMER",
    status: "ACTIVE",

    // Existing Company Link
    companyId: "",

    // New Company Registration
    newCompanyName: "",
    newCompanyLegalName: "",
    newCompanyTaxId: "",
    newCompanyRegNo: "",
    newCompanyCountryCode: "IN",
    newCompanyAddressLine1: "",
    newCompanyCity: "",
    newCompanyState: "",
    newCompanyPostalCode: "",
  });

  useEffect(() => {
    if (editingUser) {
      const primaryRole = Array.isArray(editingUser.roles)
        ? editingUser.roles[0]
        : editingUser.roles || "CUSTOMER";
      setFormData({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        password: "",
        phone: editingUser.phone || "",
        customerType: editingUser.customerType || "B2C",
        role: primaryRole,
        status: editingUser.status || "ACTIVE",
        companyId: editingUser.company?.id || "",
        newCompanyName: "",
        newCompanyLegalName: "",
        newCompanyTaxId: "",
        newCompanyRegNo: "",
        newCompanyCountryCode: "IN",
        newCompanyAddressLine1: "",
        newCompanyCity: "",
        newCompanyState: "",
        newCompanyPostalCode: "",
      });
      setB2bCompanyMode("EXISTING");
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        customerType: "B2C",
        role: "CUSTOMER",
        status: "ACTIVE",
        companyId: companies[0]?.id || "",
        newCompanyName: "",
        newCompanyLegalName: "",
        newCompanyTaxId: "",
        newCompanyRegNo: "",
        newCompanyCountryCode: "IN",
        newCompanyAddressLine1: "",
        newCompanyCity: "",
        newCompanyState: "",
        newCompanyPostalCode: "",
      });
      setB2bCompanyMode("EXISTING");
    }
  }, [editingUser, companies, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, b2bCompanyMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
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

          {/* Customer Type Switcher */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary block">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    customerType: "B2C",
                    role: "CUSTOMER",
                  }))
                }
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  formData.customerType === "B2C"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-surface-muted/50 border-border text-text-secondary hover:bg-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                B2C Retail Customer
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    customerType: "B2B",
                    role: "COMPANY_ADMIN",
                  }))
                }
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  formData.customerType === "B2B"
                    ? "bg-amber-50 border-amber-500 text-amber-800"
                    : "bg-surface-muted/50 border-border text-text-secondary hover:bg-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                B2B Wholesale Account
              </button>
            </div>
          </div>

          {/* B2B Company Options: Select Existing or Register New */}
          {formData.customerType === "B2B" && !editingUser && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  Company Affiliation
                </span>
                <div className="flex rounded-lg bg-amber-100/80 p-0.5 border border-amber-300/60 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setB2bCompanyMode("EXISTING")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      b2bCompanyMode === "EXISTING"
                        ? "bg-white text-amber-900 shadow-xs font-bold"
                        : "text-amber-800 hover:text-amber-900"
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setB2bCompanyMode("NEW")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      b2bCompanyMode === "NEW"
                        ? "bg-white text-amber-900 shadow-xs font-bold"
                        : "text-amber-800 hover:text-amber-900"
                    }`}
                  >
                    Register New
                  </button>
                </div>
              </div>

              {b2bCompanyMode === "EXISTING" ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-amber-900 block">
                    Select Existing Company
                  </label>
                  {companies.length === 0 ? (
                    <p className="text-xs text-amber-700 italic">
                      No companies registered yet. Please switch to "Register New" above.
                    </p>
                  ) : (
                    <select
                      value={formData.companyId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, companyId: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl text-text-primary focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.tradingName || c.legalName} ({c.country?.code || "IN"}) - {c.status}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        Business / Brand Name *
                      </label>
                      <input
                        type="text"
                        required={b2bCompanyMode === "NEW"}
                        value={formData.newCompanyName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, newCompanyName: e.target.value }))
                        }
                        placeholder="e.g. Acme Agro"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        Legal Registered Name *
                      </label>
                      <input
                        type="text"
                        required={b2bCompanyMode === "NEW"}
                        value={formData.newCompanyLegalName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newCompanyLegalName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Acme Agro Pvt Ltd"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        Tax ID / GSTIN
                      </label>
                      <input
                        type="text"
                        value={formData.newCompanyTaxId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newCompanyTaxId: e.target.value,
                          }))
                        }
                        placeholder="GSTIN/Tax ID"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        Registration No
                      </label>
                      <input
                        type="text"
                        value={formData.newCompanyRegNo}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newCompanyRegNo: e.target.value,
                          }))
                        }
                        placeholder="CIN / Reg No"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                        Country
                      </label>
                      <select
                        value={formData.newCompanyCountryCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            newCompanyCountryCode: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-text-primary focus:outline-none cursor-pointer"
                      >
                        <option value="IN">India (IN)</option>
                        <option value="US">United States (US)</option>
                        <option value="CA">Canada (CA)</option>
                        <option value="GB">United Kingdom (GB)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                      Principal Business Address
                    </label>
                    <input
                      type="text"
                      value={formData.newCompanyAddressLine1}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newCompanyAddressLine1: e.target.value,
                        }))
                      }
                      placeholder="Street address or office suite"
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
              className={`w-full px-3 py-2 text-xs border border-border rounded-xl text-text-primary focus:outline-none ${
                editingUser
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "bg-surface-muted/50 focus:bg-white focus:border-[#00875A]"
              }`}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary block">
              {editingUser ? "New Password (leave blank to keep current)" : "Password"}
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

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary block">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A]"
            />
          </div>

          {/* Role and Status Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Assigned Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="COMPANY_ADMIN">COMPANY_ADMIN (B2B)</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="INVITED">INVITED</option>
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
