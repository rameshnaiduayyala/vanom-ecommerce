import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import {
  CheckCircle2,
  Clock,
  Ban,
  ShieldAlert,
  AlertCircle,
  Building2,
  Lock,
  Unlock,
} from "lucide-react";

export function ChangeCompanyStatusModal({
  isOpen,
  onClose,
  company,
  onConfirm,
  isPending,
}) {
  const [selectedStatus, setSelectedStatus] = useState("APPROVED");
  const [isLocked, setIsLocked] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (company) {
      const currentStatus = company.status || "APPROVED";
      setSelectedStatus(currentStatus);
      setIsLocked(company.isLocked !== undefined ? Boolean(company.isLocked) : currentStatus === "APPROVED");
      setRejectionReason(company.rejectionReason || "");
      setError("");
    }
  }, [company, isOpen]);

  if (!isOpen || !company) return null;

  const businessName =
    company.businessName || company.legalName || "Wholesale Entity";

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    if (status === "APPROVED") {
      setIsLocked(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (selectedStatus === "REJECTED" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason for compliance records.");
      return;
    }

    onConfirm({
      id: company.id,
      status: selectedStatus,
      isLocked,
      reason: selectedStatus === "REJECTED" ? rejectionReason.trim() : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Company Status & Compliance Review"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
        {/* Business Summary Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {businessName}
            </h4>
            <p className="text-[11px] text-slate-500 font-mono">
              Current: <strong className="text-slate-700">{company.status || "PENDING"}</strong> • Tax ID: {company.taxRegistrationNumber || company.taxId || "N/A"}
            </p>
          </div>
        </div>

        {/* Status Selection Cards */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Select New Status *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* APPROVED */}
            <button
              type="button"
              onClick={() => handleStatusSelect("APPROVED")}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                selectedStatus === "APPROVED"
                  ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  selectedStatus === "APPROVED"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              />
              <div>
                <div className="font-bold text-xs">APPROVED</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Full wholesale access & catalog
                </div>
              </div>
            </button>

            {/* PENDING */}
            <button
              type="button"
              onClick={() => handleStatusSelect("PENDING")}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                selectedStatus === "PENDING"
                  ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 text-amber-950"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <Clock
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  selectedStatus === "PENDING"
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              />
              <div>
                <div className="font-bold text-xs">PENDING</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Under review (no catalog access)
                </div>
              </div>
            </button>

            {/* SUSPENDED */}
            <button
              type="button"
              onClick={() => handleStatusSelect("SUSPENDED")}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                selectedStatus === "SUSPENDED"
                  ? "bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 text-orange-950"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <ShieldAlert
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  selectedStatus === "SUSPENDED"
                    ? "text-orange-600"
                    : "text-slate-400"
                }`}
              />
              <div>
                <div className="font-bold text-xs">SUSPENDED</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Temporarily pause privileges
                </div>
              </div>
            </button>

            {/* REJECTED */}
            <button
              type="button"
              onClick={() => handleStatusSelect("REJECTED")}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                selectedStatus === "REJECTED"
                  ? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 text-rose-950"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <Ban
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  selectedStatus === "REJECTED"
                    ? "text-rose-600"
                    : "text-slate-400"
                }`}
              />
              <div>
                <div className="font-bold text-xs">REJECTED</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Decline onboarding request
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Rejection Reason Input (Mandatory if REJECTED) */}
        {selectedStatus === "REJECTED" && (
          <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
            <label className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Rejection Reason (Visible to Customer) *
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Tax registration certificate / EIN could not be verified with tax authority records. Please provide a clear copy."
              className="w-full px-3 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-rose-500 resize-none font-medium"
            />
            <p className="text-[10px] text-slate-500 leading-tight">
              This explanation will be displayed to the B2B customer on their portal screen when logging in.
            </p>
          </div>
        )}

        {/* Lock / Unlock Business Profile Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isLocked
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <label
                htmlFor="lock-profile-toggle"
                className="font-bold text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lock Profile & KYC Certificates</span>
                {isLocked ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded">
                    Locked
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded">
                    Unlocked
                  </span>
                )}
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                When locked, buyer cannot modify legal business details, tax ID, registration numbers, or delete certificates.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="lock-profile-toggle"
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* General Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isPending}
            className={`font-bold text-xs shadow-sm ${
              selectedStatus === "APPROVED"
                ? "bg-[#00875A] hover:bg-[#00734D] text-white"
                : selectedStatus === "REJECTED"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : selectedStatus === "SUSPENDED"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-slate-800 hover:bg-slate-900 text-white"
            }`}
          >
            {isPending ? "Applying Changes..." : "Save Compliance Review"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangeCompanyStatusModal;
