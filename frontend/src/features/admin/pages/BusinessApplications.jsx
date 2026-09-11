import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Globe,
  FileText,
  User,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Api } from "@/services/api/api-client.js";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import { useUIStore } from "../../../stores/ui.store.js";

export function BusinessApplications() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [reviewingCompany, setReviewingCompany] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Fetch Companies & Applications
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => Api.admin.getCompanies(),
  });

  const allCompanies = Array.isArray(companiesData) ? companiesData : companiesData?.items || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      return Api.admin.approveApplication(id, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      addToast({
        title: "Company Approved",
        message: "The B2B business account has been approved for wholesale ordering.",
        type: "success",
      });
      setReviewingCompany(null);
      setReviewNotes("");
    },
    onError: (err) => {
      addToast({
        title: "Approval Failed",
        message: err.message || "Failed to approve company",
        type: "error",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return Api.admin.rejectApplication(id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      addToast({
        title: "Company Application Rejected",
        message: "The application has been rejected and status updated.",
        type: "error",
      });
      setIsRejectModalOpen(false);
      setReviewingCompany(null);
      setRejectReason("");
    },
    onError: (err) => {
      addToast({
        title: "Rejection Failed",
        message: err.message || "Failed to reject company application",
        type: "error",
      });
    },
  });

  // Filter items
  const filteredList = allCompanies.filter((comp) => {
    const legalName = (comp.legalName || "").toLowerCase();
    const tradingName = (comp.tradingName || "").toLowerCase();
    const taxId = (comp.taxId || "").toLowerCase();
    const country = (comp.country?.name || comp.countryCode || "").toLowerCase();

    const matchesSearch =
      !searchTerm ||
      legalName.includes(searchTerm.toLowerCase()) ||
      tradingName.includes(searchTerm.toLowerCase()) ||
      taxId.includes(searchTerm.toLowerCase()) ||
      country.includes(searchTerm.toLowerCase());

    const compStatus = String(comp.status || "PENDING").toUpperCase();
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && (compStatus === "PENDING" || compStatus === "UNDER_REVIEW")) ||
      compStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = allCompanies.filter(
    (c) => c.status === "PENDING" || c.status === "UNDER_REVIEW"
  ).length;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-[#00875A]" />
              B2B Business Verification & Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Review onboarding applications, verify commercial tax registrations, and authorize wholesale trade access.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted">Total Companies:</span>
          <span className="font-bold text-text-primary">{allCompanies.length}</span>
        </div>
      </div>

      {/* ─── Filters & Search ─── */}
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
            {[
              { label: "Pending Review", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "All Statuses", value: "ALL" },
            ].map((tab) => (
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

      {/* ─── Applications / Companies List ─── */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden text-xs shadow-xs">
        <table className="w-full text-left">
          <thead className="bg-[#FAFBFB] text-text-muted text-[11px] uppercase tracking-wider font-bold border-b border-border">
            <tr>
              <th className="p-4">Corporate Entity</th>
              <th className="p-4">Country & Tax ID</th>
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
              filteredList.map((comp) => {
                const primaryMember =
                  comp.members?.find((m) => m.isPrimary) || comp.members?.[0];
                const primaryUser = primaryMember?.user;
                const status = comp.status || "PENDING";

                return (
                  <tr key={comp.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-700 font-bold shrink-0">
                          <Building2 className="w-4 h-4 text-[#00875A]" />
                        </div>
                        <div>
                          <div className="font-bold text-text-primary text-[13px]">
                            {comp.legalName}
                          </div>
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
                      <Badge
                        variant={
                          status === "APPROVED"
                            ? "green"
                            : status === "REJECTED"
                            ? "red"
                            : "yellow"
                        }
                        size="sm"
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setReviewingCompany(comp);
                            setReviewNotes("");
                          }}
                          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-border hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00875A]" />
                          Review Dossier
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-muted text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileCheck2 className="w-8 h-8 text-slate-300" />
                    <span>No business applications matching "{searchTerm || statusFilter}".</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Review Dossier Modal ─── */}
      {reviewingCompany && (
        <Modal
          isOpen={!!reviewingCompany}
          onClose={() => setReviewingCompany(null)}
          title={`Corporate Dossier: ${reviewingCompany.legalName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted border border-border">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Application Status:</span>
                <Badge
                  variant={
                    reviewingCompany.status === "APPROVED"
                      ? "green"
                      : reviewingCompany.status === "REJECTED"
                      ? "red"
                      : "yellow"
                  }
                  size="md"
                >
                  {reviewingCompany.status}
                </Badge>
              </div>
              <span className="text-[11px] text-text-muted font-mono">
                ID: {reviewingCompany.id}
              </span>
            </div>

            {/* Entity Details Grid */}
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-border">
              <div>
                <span className="text-text-muted block text-[11px]">Legal Business Name</span>
                <span className="font-bold text-text-primary text-sm">{reviewingCompany.legalName}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Brand / Trading Name</span>
                <span className="font-medium text-text-primary">{reviewingCompany.tradingName || "Same as legal"}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Tax ID / GST Number</span>
                <span className="font-mono font-bold text-text-primary">{reviewingCompany.taxId || "Pending"}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Registration / License No</span>
                <span className="font-mono text-text-secondary">{reviewingCompany.registrationNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Country Jurisdiction</span>
                <span className="font-medium text-text-primary">{reviewingCompany.country?.name || reviewingCompany.countryCode || "Global"}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Payment Terms & Credit</span>
                <span className="font-semibold text-text-primary">
                  NET {reviewingCompany.paymentTermsDays || 30} Days • ${(reviewingCompany.creditLimit || 0).toLocaleString()} Credit
                </span>
              </div>
            </div>

            {/* Primary Contact Details */}
            {reviewingCompany.members?.[0]?.user && (
              <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00875A]" />
                  Designated Company Administrator
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted block text-[11px]">Full Name</span>
                    <span className="font-semibold text-text-primary">
                      {reviewingCompany.members[0].user.firstName} {reviewingCompany.members[0].user.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Work Email</span>
                    <span className="font-medium text-text-primary">{reviewingCompany.members[0].user.email}</span>
                  </div>
                  {reviewingCompany.members[0].user.phone && (
                    <div>
                      <span className="text-text-muted block text-[11px]">Contact Phone</span>
                      <span className="font-medium text-text-primary">{reviewingCompany.members[0].user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Decision Notes Input */}
            <div className="space-y-2">
              <label className="block font-semibold text-text-primary">
                Compliance Review Decision Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Add compliance notes or reason for approval..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-[#00875A]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewingCompany(null)}
                className="text-xs"
              >
                Close Dossier
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="text-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Application
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    approveMutation.mutate({
                      id: reviewingCompany.id,
                      notes: reviewNotes || "Approved by Administrator",
                    })
                  }
                  isLoading={approveMutation.isPending}
                  className="bg-[#00875A] hover:bg-[#00734D] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Wholesale Account
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Reject Confirmation Modal ─── */}
      {isRejectModalOpen && reviewingCompany && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title={`Reject Application: ${reviewingCompany.legalName}`}
          maxWidth="max-w-md"
        >
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
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-red-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!rejectReason.trim()}
                isLoading={rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    id: reviewingCompany.id,
                    reason: rejectReason.trim(),
                  })
                }
                className="text-xs font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default BusinessApplications;
