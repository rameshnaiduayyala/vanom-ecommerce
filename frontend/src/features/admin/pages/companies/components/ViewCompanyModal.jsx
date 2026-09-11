import React from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { formatPrice } from "@/utils/formatters.js";
import {
  Building2,
  Globe,
  FileText,
  User,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export function ViewCompanyModal({ company, isOpen, onClose, onEdit }) {
  if (!isOpen || !company) return null;

  const primaryMember = company.members?.find((m) => m.isPrimary) || company.members?.[0];
  const adminUser = primaryMember?.user;
  const defaultAddress =
    company.addresses?.find((a) => a.isDefault) ||
    company.addresses?.[0] ||
    (company.address ? company.address : null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Corporate Entity Dossier"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-xs text-text-primary max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start pb-4 border-b border-border">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 text-amber-800 font-black text-2xl flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
            <Building2 className="w-8 h-8 text-amber-800" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" size="sm">
                B2B Corporate Wholesale
              </Badge>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  company.status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : company.status === "PENDING" || company.status === "UNDER_REVIEW"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {company.status === "APPROVED" ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : company.status === "PENDING" || company.status === "UNDER_REVIEW" ? (
                  <Clock className="w-3 h-3 text-amber-600" />
                ) : (
                  <Ban className="w-3 h-3 text-red-500" />
                )}
                {company.status || "PENDING"}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {company.tradingName || company.legalName}
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
              Company Legal Registrations
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Legal Entity Name</span>
                <span className="font-semibold text-text-primary">{company.legalName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Brand / Trading Name</span>
                <span className="font-semibold text-text-primary">{company.tradingName || company.legalName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Tax ID / GST / EIN</span>
                <span className="font-mono font-bold text-amber-700">{company.taxId || "Not Provided"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Company Registration No.</span>
                <span className="font-mono font-semibold text-text-primary">{company.registrationNumber || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Wholesale Credit & Payment Facility */}
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              Wholesale Credit & Terms
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Approved Credit Limit</span>
                <span className="font-bold text-emerald-800 text-sm">
                  {formatPrice(company.creditLimit || 0, company.country?.currencyCode || "USD")}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Invoice Payment Terms</span>
                <span className="font-bold text-text-primary">NET {company.paymentTermsDays || 30} Days</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Operating Jurisdiction</span>
                <span className="font-semibold text-text-primary flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-text-muted" />
                  {company.country?.name || company.countryCode || "India (IN)"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Currency Code</span>
                <span className="font-mono font-bold text-slate-800">{company.country?.currencyCode || "USD"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Administrator Profile */}
        <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
          <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Primary Corporate Administrator
          </h5>
          {adminUser ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Admin Name</span>
                <span className="font-bold text-text-primary text-sm">{adminUser.firstName} {adminUser.lastName}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Official Email</span>
                <span className="font-medium text-text-primary">{adminUser.email}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-border">
                <span className="text-text-muted block text-[10px] uppercase font-semibold">Phone Number</span>
                <span className="font-mono font-semibold text-text-primary">{adminUser.phone || "N/A"}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white border border-border text-text-muted italic">
              No designated administrator attached to this entity record.
            </div>
          )}
        </div>

        {/* Registered Business Address */}
        {defaultAddress && (
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              Registered Commercial Address
            </h5>
            <div className="bg-white p-3 rounded-xl border border-border text-xs space-y-1">
              <p className="font-semibold text-text-primary">{defaultAddress.line1}</p>
              {defaultAddress.line2 && <p className="text-text-muted">{defaultAddress.line2}</p>}
              <p className="text-text-secondary">
                {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
              </p>
              {defaultAddress.phone && (
                <p className="text-text-muted font-mono pt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {defaultAddress.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/companies/${company.id}`}
              className="text-xs font-semibold text-[#00875A] hover:underline flex items-center gap-1"
            >
              <span>View Compliance Audit Record</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
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
                Edit Entity
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
