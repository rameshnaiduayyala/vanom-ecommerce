import React, { useState, useEffect } from "react";
import { User, UserPlus, Edit2, X, Globe, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "USER",
    isActive: true,
    countryId: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadCountries() {
      try {
        const list = await Api.geography.getCountries();
        if (isMounted) setCountries(list || []);
      } catch (e) {
        console.error("Failed to load countries in UserFormModal:", e);
      }
    }
    loadCountries();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        email: editingUser.email || "",
        password: "",
        role: editingUser.role || "USER",
        isActive: editingUser.isActive ?? true,
        countryId: editingUser.countryId || editingUser.country?.id || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USER",
        isActive: true,
        countryId: countries[0]?.id || "",
      });
    }
  }, [editingUser, countries, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
              {editingUser ? "New Password (leave blank to keep current)" : "Password *"}
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
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="USER">USER (Standard Retail / Customer)</option>
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
