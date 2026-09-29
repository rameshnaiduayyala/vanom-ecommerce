import React from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import {
  Building2,
  Globe,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  MapPin,
  Mail,
  Phone,
  Edit2,
  FileText,
  Lock,
  Unlock,
} from "lucide-react";

export function ViewCompanyModal({
  company,
  isOpen,
  onClose,
  onEdit,
  onChangeStatus,
}) {
  if (!isOpen || !company) return null;

  const adminUser = company.user;
  const businessName = company.businessName || company.legalName || "Unnamed Business";
  const isLocked = Boolean(company.isLocked);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wholesale Business Entity Dossier"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-xs text-text-primary max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start pb-4 border-b border-border">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 text-amber-800 font-black text-2xl flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
            <Building2 className="w-8 h-8 text-amber-800" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning" size="sm">
                B2B Corporate Wholesale Partner
              </Badge>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChangeStatus && onChangeStatus(company);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition hover:opacity-85 ${
                  company.status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : company.status === "PENDING"
                    ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                }`}
                title="Click to change status or lock settings"
              >
                {company.status === "APPROVED" ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : company.status === "PENDING" ? (
                  <Clock className="w-3 h-3 text-amber-600" />
                ) : (
                  <Ban className="w-3 h-3 text-red-500" />
                )}
                {company.status || "PENDING"}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChangeStatus && onChangeStatus(company);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition hover:opacity-85 ${
                  isLocked
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                }`}
                title="Click to modify lock settings in Status Modal"
              >
                {isLocked ? (
                  <>
                    <Lock className="w-3 h-3 text-emerald-700" />
                    <span>Profile Locked</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 text-slate-500" />
                    <span>Unlocked (Editable)</span>
                  </>
                )}
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {businessName}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-text-muted font-mono text-[11px]">
              <span>ID: <strong className="text-text-primary">{company.id}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Registered: {company.createdAt ? new Date(company.createdAt).toLocaleString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Corporate Legal Attributes */}
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#00875A]" />
              Registration & Tax Details
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Business Name</span>
                <span className="font-semibold text-text-primary">{businessName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Tax Registration (GST/EIN)</span>
                <span className="font-mono font-bold text-amber-800">{company.taxRegistrationNumber || "Not Provided"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Corporate Reg No.</span>
                <span className="font-mono font-semibold text-text-primary">{company.registrationNumber || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Country Jurisdiction</span>
                <span className="font-bold text-text-primary flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-text-muted" />
                  {company.countryCode || "US"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-700" />
              Direct Contact Details
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Contact Person</span>
                <span className="font-semibold text-text-primary">{company.contactPersonName || "Direct"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Business Email</span>
                <span className="font-medium text-text-primary">{company.businessEmail || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Business Phone</span>
                <span className="font-mono font-semibold text-text-primary">{company.businessPhone || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Approval Status</span>
                <span className="font-bold text-emerald-700">{company.status || "APPROVED"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linked User Accounts / Team Members */}
        <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
          <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Wholesale Authorized Users ({company.users?.length || (adminUser ? 1 : 0)})
          </h5>
          {company.users && company.users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {company.users.map((u) => (
                <div key={u.id} className="bg-white p-3 rounded-xl border border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-text-primary">
                      {u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Member"}
                    </div>
                    <div className="text-[11px] text-text-muted">{u.email}</div>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          ) : adminUser ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">User Name</span>
                <span className="font-bold text-text-primary text-sm">{adminUser.firstName || adminUser.lastName ? `${adminUser.firstName || ""} ${adminUser.lastName || ""}`.trim() : "Linked User"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Login Email</span>
                <span className="font-medium text-text-primary">{adminUser.email}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Role</span>
                <span className="font-mono font-bold text-purple-700">{adminUser.role || "USER"}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white border border-border text-text-muted italic">
              No user account is directly attached to this business yet.
            </div>
          )}
        </div>

        {/* Registered Business Address */}
        {company.address && (
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              Principal Business Address
            </h5>
            <div className="bg-white p-3 rounded-xl border border-border text-xs flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-medium text-text-primary">{company.address}</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            {onChangeStatus && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  onClose();
                  onChangeStatus(company);
                }}
                className="border-amber-400 text-amber-900 hover:bg-amber-50"
              >
                Change Status & Lock Review
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onEdit && (
              <Button
                variant="outline"
                size="md"
                icon={Edit2}
                onClick={() => {
                  onClose();
                  onEdit(company);
                }}
                className="cursor-pointer"
              >
                Edit Business
              </Button>
            )}
            <Button variant="secondary" size="md" onClick={onClose}>
              Close Dossier
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ViewCompanyModal;
