import React from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import {
  User,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  MapPin,
  CreditCard,
  Layers,
  Edit2,
} from "lucide-react";

export function ViewUserModal({ user, isOpen, onClose, onEdit }) {
  if (!isOpen || !user) return null;

  const roles = Array.isArray(user.roles) ? user.roles : [user.roles || "CUSTOMER"];
  const isB2B = user.customerType === "B2B" || roles.includes("COMPANY_ADMIN");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account Dossier"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-xs text-text-primary max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start pb-4 border-b border-border">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 text-[#00875A] font-black text-2xl flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
            {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isB2B ? "warning" : "brand"} size="sm">
                {isB2B ? "B2B Corporate Wholesale" : "B2C Retail Customer"}
              </Badge>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  user.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : user.status === "PENDING"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {user.status === "ACTIVE" ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : user.status === "PENDING" ? (
                  <Clock className="w-3 h-3 text-amber-600" />
                ) : (
                  <Ban className="w-3 h-3 text-red-500" />
                )}
                {user.status || "ACTIVE"}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : "Unnamed User"}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-text-muted font-mono text-[11px]">
              <span>ID: <strong className="text-text-primary">{user.id}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Registered: {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00875A]" />
              Contact Information
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Email Address</span>
                <span className="font-semibold text-text-primary">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Telephone / Mobile</span>
                <span className="font-semibold text-text-primary">{user.phone || "Not Provided"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Email Verified</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Role & Security */}
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Roles & Permissions
            </h5>
            <div className="space-y-2 text-xs">
              <div className="py-1 border-b border-border/50">
                <span className="text-text-muted block text-[10px] uppercase font-semibold mb-1">Assigned Security Roles</span>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map((r, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-border shadow-2xs text-text-primary"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Security Access Tier</span>
                <span className="font-mono font-bold text-[#00875A]">
                  {roles.includes("SUPER_ADMIN") ? "L1-SUPER-ADMIN" : roles.includes("ADMIN") ? "L2-PORTAL-ADMIN" : "L3-CUSTOMER"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Association (if B2B or company linked) */}
        {user.company && (
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              Corporate Entity Association
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Legal Entity Name</span>
                <span className="font-bold text-text-primary text-sm">{user.company.legalName}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Trading / Business Name</span>
                <span className="font-semibold text-text-primary">{user.company.tradingName || user.company.legalName}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Tax Identification (GST/EIN)</span>
                <span className="font-mono font-bold text-amber-700">{user.company.taxId || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          {onEdit && (
            <Button
              variant="outline"
              size="md"
              icon={Edit2}
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="cursor-pointer"
            >
              Edit Account
            </Button>
          )}

          <Button variant="secondary" size="md" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ViewUserModal;
