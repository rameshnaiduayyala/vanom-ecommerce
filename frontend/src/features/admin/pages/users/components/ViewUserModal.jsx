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
  XCircle,
  Globe,
  ShoppingBag,
  FileText,
  MapPin,
  Edit2,
} from "lucide-react";

export function ViewUserModal({ user, isOpen, onClose, onEdit }) {
  if (!isOpen || !user) return null;

  const isSuperAdmin = user.role === "SUPERADMIN";
  const isB2B = Boolean(user.bulkBusiness);
  const isActive = user.isActive ?? true;
  const b2b = user.bulkBusiness;
  const ordersCount = user._count?.orders ?? 0;
  const reviewsCount = user._count?.reviews ?? 0;

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
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl font-black text-2xl flex items-center justify-center shrink-0 border shadow-2xs ${
              isSuperAdmin
                ? "bg-purple-100 text-purple-800 border-purple-200"
                : isB2B
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-emerald-100 text-[#00875A] border-emerald-200"
            }`}
          >
            {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isSuperAdmin ? "brand" : isB2B ? "warning" : "default"} size="sm">
                {isSuperAdmin
                  ? "System Administrator (SUPERADMIN)"
                  : isB2B
                  ? "B2B Corporate Wholesale Buyer"
                  : "Retail Customer (USER)"}
              </Badge>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {isActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Active Account
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    Inactive Account
                  </>
                )}
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
                <span className="font-semibold text-text-primary">
                  {user.phone || b2b?.businessPhone || "Not Provided"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Assigned Country</span>
                <span className="font-semibold text-text-primary flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-text-muted" />
                  {user.country?.name || user.country?.code || b2b?.countryCode || "Global / Unset"}
                </span>
              </div>
            </div>
          </div>

          {/* Role & Engagement */}
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Security & Activity
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Assigned Role</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-border text-text-primary uppercase">
                  {user.role || "USER"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Lifetime Orders</span>
                <span className="font-bold text-text-primary flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#00875A]" />
                  {ordersCount} Orders
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Submitted Reviews</span>
                <span className="font-bold text-text-primary flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  {reviewsCount} Reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* B2B Bulk Business Profile (if linked) */}
        {b2b && (
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
            <h5 className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              B2B Wholesale Business Profile
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Business Name</span>
                <span className="font-bold text-text-primary text-sm">{b2b.businessName}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Registration / Tax ID</span>
                <span className="font-mono font-bold text-amber-800">
                  {b2b.taxRegistrationNumber || b2b.registrationNumber || "N/A"}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">B2B Status & Contact</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-semibold text-text-primary">{b2b.contactPersonName || "Direct"}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    {b2b.status || "APPROVED"}
                  </span>
                </div>
              </div>
            </div>
            {b2b.address && (
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center gap-2 text-text-secondary">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{b2b.address}</span>
              </div>
            )}
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
