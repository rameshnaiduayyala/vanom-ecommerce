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
} from "lucide-react";

export function ChangeCompanyStatusModal({
  isOpen,
  onClose,
  company,
  onConfirm,
  isPending,
}) {
  const [selectedStatus, setSelectedStatus] = useState("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (company) {
      setSelectedStatus(company.status || "APPROVED");
      setRejectionReason(company.rejectionReason || "");
      setError("");
    }
  }, [company, isOpen]);

  if (!isOpen || !company) return null;

  const businessName =
    company.businessName || company.legalName || "Wholesale Entity";

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
              onClick={() => setSelectedStatus("APPROVED")}
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
              onClick={() => setSelectedStatus("PENDING")}
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
              onClick={() => setSelectedStatus("SUSPENDED")}
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
              onClick={() => setSelectedStatus("REJECTED")}
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
            {isPending ? "Updating Status..." : `Apply Status: ${selectedStatus}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
