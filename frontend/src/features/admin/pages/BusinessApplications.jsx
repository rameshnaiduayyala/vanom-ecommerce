import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, FileCheck2, CheckCircle2, XCircle,
  Clock, Search, Filter, Eye, Globe, User,
} from "lucide-react";
import { Api } from "@/services/api/api-client.js";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import { useBusinessReviewMutations, filterCompanies } from "./useBusinessReview.js";

const STATUS_TABS = [
  { label: "Pending Review", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All Statuses", value: "ALL" },
];

export function BusinessApplications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [reviewingCompany, setReviewingCompany] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const closeReview = () => { setReviewingCompany(null); setReviewNotes(""); };
  const closeReject = () => { setIsRejectModalOpen(false); setRejectReason(""); };

  const { approveMutation, rejectMutation } = useBusinessReviewMutations({
    onApproveSuccess: closeReview,
    onRejectSuccess: () => { closeReject(); closeReview(); },
  });

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => Api.admin.getCompanies(),
  });

  const allCompanies = Array.isArray(companiesData)
    ? companiesData
    : companiesData?.items || [];

  const filteredList = filterCompanies(allCompanies, searchTerm, statusFilter);
  const pendingCount = allCompanies.filter(
    (c) => c.status === "PENDING" || c.status === "UNDER_REVIEW"
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-[#00875A]" />
              B2B Business Verification &amp; Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Review onboarding applications, verify commercial tax registrations,
            and authorize wholesale trade access.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted">Total Companies:</span>
          <span className="font-bold text-text-primary">{allCompanies.length}</span>
        </div>
      </div>

      {/* ── Search & Filter ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, tax ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-[#00875A] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-text-muted shrink-0" />
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border text-xs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 font-medium rounded-lg transition-all ${
                  statusFilter === tab.value
                    ? "bg-white text-text-primary shadow-2xs font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Company Table ───────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden text-xs shadow-xs">
        <table className="w-full text-left">
          <thead className="bg-[#FAFBFB] text-text-muted text-[11px] uppercase tracking-wider font-bold border-b border-border">
            <tr>
              <th className="p-4">Corporate Entity</th>
              <th className="p-4">Country &amp; Tax ID</th>
              <th className="p-4">Contact Person</th>
              <th className="p-4">Payment Terms</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-5 h-5 animate-spin text-[#00875A]" />
                    <span>Loading business verification records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredList.length > 0 ? (
              filteredList.map((comp) => (
                <CompanyRow
                  key={comp.id}
                  comp={comp}
                  onReview={() => { setReviewingCompany(comp); setReviewNotes(""); }}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-muted text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileCheck2 className="w-8 h-8 text-slate-300" />
                    <span>No business applications matching &quot;{searchTerm || statusFilter}&quot;.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Review Dossier Modal ─────────────────────────────────────────── */}
      {reviewingCompany && (
        <Modal
          isOpen={!!reviewingCompany}
          onClose={closeReview}
          title={`Corporate Dossier: ${reviewingCompany.legalName}`}
          maxWidth="max-w-2xl"
        >
          <DossierContent
            company={reviewingCompany}
            reviewNotes={reviewNotes}
            onNotesChange={setReviewNotes}
            onClose={closeReview}
            onReject={() => setIsRejectModalOpen(true)}
            onApprove={() =>
              approveMutation.mutate({
                id: reviewingCompany.id,
                notes: reviewNotes || "Approved by Administrator",
              })
            }
            isApproving={approveMutation.isPending}
            isRejecting={rejectMutation.isPending}
          />
        </Modal>
      )}

      {/* ── Reject Confirmation Modal ────────────────────────────────────── */}
      {isRejectModalOpen && reviewingCompany && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={closeReject}
          title={`Reject Application: ${reviewingCompany.legalName}`}
          maxWidth="max-w-md"
        >
          <RejectContent
            rejectReason={rejectReason}
            onReasonChange={setRejectReason}
            onCancel={closeReject}
            onConfirm={() =>
              rejectMutation.mutate({
                id: reviewingCompany.id,
                reason: rejectReason.trim(),
              })
            }
            isLoading={rejectMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

// ── Private sub-components ────────────────────────────────────────────────────

function CompanyRow({ comp, onReview }) {
  const primaryUser = comp.members?.find((m) => m.isPrimary)?.user || comp.members?.[0]?.user;
  const status = comp.status || "PENDING";
  const badgeVariant = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "yellow";

  return (
    <tr className="hover:bg-surface-muted/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-[#00875A]" />
          </div>
          <div>
            <div className="font-bold text-text-primary text-[13px]">{comp.legalName}</div>
            {comp.tradingName && comp.tradingName !== comp.legalName && (
              <div className="text-[11px] text-text-muted">
                Trading as: <span className="text-text-secondary font-medium">{comp.tradingName}</span>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-text-primary font-medium flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-text-muted" />
          {comp.country?.name || comp.countryCode || "Global"}
        </div>
        <div className="font-mono text-[11px] text-text-muted mt-0.5">
          Tax/GST: <span className="text-text-secondary font-semibold">{comp.taxId || "Not Provided"}</span>
        </div>
      </td>
      <td className="p-4">
        {primaryUser ? (
          <div>
            <div className="font-semibold text-text-primary">
              {primaryUser.firstName} {primaryUser.lastName}
            </div>
            <div className="text-[11px] text-text-muted">{primaryUser.email}</div>
          </div>
        ) : (
          <span className="text-text-muted italic">No linked contact</span>
        )}
      </td>
      <td className="p-4">
        <span className="font-semibold text-text-secondary">
          {comp.paymentTermsDays ? `NET ${comp.paymentTermsDays} Days` : "Prepaid (NET 0)"}
        </span>
      </td>
      <td className="p-4">
        <Badge variant={badgeVariant} size="sm">{status}</Badge>
      </td>
      <td className="p-4 text-right">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReview}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-border hover:bg-slate-100"
        >
          <Eye className="w-3.5 h-3.5 text-[#00875A]" />
          Review Dossier
        </Button>
      </td>
    </tr>
  );
}

function DossierContent({ company, reviewNotes, onNotesChange, onClose, onReject, onApprove, isApproving, isRejecting }) {
  const status = company.status;
  const badgeVariant = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "yellow";
  const primaryUser = company.members?.[0]?.user;

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted border border-border">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Application Status:</span>
          <Badge variant={badgeVariant} size="md">{status}</Badge>
        </div>
        <span className="text-[11px] text-text-muted font-mono">ID: {company.id}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-border">
        <InfoField label="Legal Business Name" value={company.legalName} bold />
        <InfoField label="Brand / Trading Name" value={company.tradingName || "Same as legal"} />
        <InfoField label="Tax ID / GST Number" value={company.taxId || "Pending"} mono bold />
        <InfoField label="Registration / License No" value={company.registrationNumber || "N/A"} mono />
        <InfoField label="Country Jurisdiction" value={company.country?.name || company.countryCode || "Global"} />
        <InfoField
          label="Payment Terms & Credit"
          value={`NET ${company.paymentTermsDays || 30} Days • $${(company.creditLimit || 0).toLocaleString()} Credit`}
          bold
        />
      </div>

      {primaryUser && (
        <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-2">
          <h4 className="font-bold text-text-primary flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#00875A]" />
            Designated Company Administrator
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <InfoField label="Full Name" value={`${primaryUser.firstName} ${primaryUser.lastName}`} bold />
            <InfoField label="Work Email" value={primaryUser.email} />
            {primaryUser.phone && <InfoField label="Contact Phone" value={primaryUser.phone} />}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block font-semibold text-text-primary">
          Compliance Review Decision Notes (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Add compliance notes or reason for approval..."
          value={reviewNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-3 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-[#00875A]"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Close Dossier
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="danger" size="sm"
            onClick={onReject}
            disabled={isApproving || isRejecting}
            className="text-xs flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject Application
          </Button>
          <Button
            variant="primary" size="sm"
            onClick={onApprove}
            isLoading={isApproving}
            className="bg-[#00875A] hover:bg-[#00734D] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Wholesale Account
          </Button>
        </div>
      </div>
    </div>
  );
}

function RejectContent({ rejectReason, onReasonChange, onCancel, onConfirm, isLoading }) {
  return (
    <div className="space-y-4 text-xs">
      <p className="text-text-muted">
        Please specify the reason for rejecting this wholesale account verification application.
      </p>
      <div>
        <label className="block font-semibold text-text-primary mb-1">
          Rejection Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Invalid tax certificate or unverified commercial business license"
          value={rejectReason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full px-3 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-red-500"
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">Cancel</Button>
        <Button
          variant="danger" size="sm"
          disabled={!rejectReason.trim()}
          isLoading={isLoading}
          onClick={onConfirm}
          className="text-xs font-bold"
        >
          Confirm Rejection
        </Button>
      </div>
    </div>
  );
}

function InfoField({ label, value, bold, mono }) {
  return (
    <div>
      <span className="text-text-muted block text-[11px]">{label}</span>
      <span className={`text-text-primary ${bold ? "font-bold" : "font-medium"} ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default BusinessApplications;
