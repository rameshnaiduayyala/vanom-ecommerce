import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { ROUTES } from "../../../constants/routes.js";
import {
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Lock,
  Clock,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import { ChangeCompanyStatusModal } from "./companies/components/ChangeCompanyStatusModal.jsx";

export function CompanyReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => Api.admin.getCompanies(),
  });

  const companiesList = Array.isArray(companiesData)
    ? companiesData
    : companiesData?.items || [];

  const company =
    companiesList.find((c) => c.id === id) ||
    (companiesList.length > 0 ? companiesList[0] : null);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }) => {
      return Api.admin.changeCompanyStatus(id, status, reason);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      addToast({
        title: "Company Status Updated",
        message: `Company status changed to ${variables.status} successfully.`,
        type: variables.status === "REJECTED" ? "error" : "success",
      });
      setStatusModalOpen(false);
      setRejectModalOpen(false);
      setRejectionReason("");
    },
    onError: (err) => {
      addToast({
        title: "Status Update Failed",
        message: err.message || "Failed to update company status",
        type: "error",
      });
    },
  });

  const handleQuickApprove = () => {
    if (!company) return;
    statusMutation.mutate({
      id: company.id,
      status: "APPROVED",
    });
  };

  const handleQuickSuspend = () => {
    if (!company) return;
    statusMutation.mutate({
      id: company.id,
      status: "SUSPENDED",
    });
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!company) return;
    if (!rejectionReason.trim()) {
      addToast({
        title: "Rejection Reason Required",
        message: "Please enter a reason explaining why this company application is rejected.",
        type: "error",
      });
      return;
    }
    statusMutation.mutate({
      id: company.id,
      status: "REJECTED",
      reason: rejectionReason.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Clock className="w-8 h-8 animate-spin text-[#00875A]" />
        <p className="text-xs font-medium">Loading company dossier...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-border space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Company Record Not Found</h3>
        <p className="text-xs text-slate-500">The requested company dossier ID does not exist or has been removed.</p>
        <Link to={ROUTES.ADMIN.COMPANIES}>
          <Button variant="outline" size="sm">Back to Companies</Button>
        </Link>
      </div>
    );
  }

  const countryName =
    typeof company?.country === "object"
      ? company?.country?.name || company?.country?.code
      : company?.country || company?.countryCode || "Global";

  const paymentTerms =
    company?.paymentTerms ||
    (company?.paymentTermsDays !== undefined ? `NET_${company.paymentTermsDays}` : "NET_30");

  const primaryContactName =
    company?.primaryContact ||
    (company?.members?.[0]?.user
      ? `${company.members[0].user.firstName || ""} ${company.members[0].user.lastName || ""}`.trim()
      : "Not Provided");

  const contactEmail =
    company?.email || company?.members?.[0]?.user?.email || "Not Provided";

  const currentStatus = company?.status || "PENDING";

  return (
    <div className="space-y-6">
      <Link to={ROUTES.ADMIN.COMPANIES} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Companies Directory
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">{company.legalName || company.tradingName || company.businessName}</h1>
            <Badge
              variant={
                currentStatus === "APPROVED"
                  ? "green"
                  : currentStatus === "REJECTED"
                  ? "red"
                  : currentStatus === "SUSPENDED"
                  ? "orange"
                  : "yellow"
              }
              size="md"
            >
              {currentStatus}
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Dossier ID: {company.id} • Registered in {countryName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            className="text-xs border-slate-300 hover:bg-slate-50 text-slate-700"
          >
            Change Status...
          </Button>

          {currentStatus !== "SUSPENDED" && currentStatus === "APPROVED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickSuspend}
              disabled={statusMutation.isPending}
              className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              Suspend
            </Button>
          )}

          {currentStatus !== "REJECTED" && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setRejectionReason(company.rejectionReason || "");
                setRejectModalOpen(true);
              }}
              disabled={statusMutation.isPending}
              className="text-xs flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject Application
            </Button>
          )}

          {currentStatus !== "APPROVED" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleQuickApprove}
              disabled={statusMutation.isPending}
              className="text-xs bg-[#00875A] hover:bg-[#00734D] text-white font-bold flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve Wholesale Account
            </Button>
          )}
        </div>
      </div>

      {/* Rejection Notice Banner if rejected */}
      {currentStatus === "REJECTED" && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-950">Company Application Marked as Rejected</h4>
            <p className="text-rose-800">
              <strong>Reason:</strong> {company.rejectionReason || "No specific reason provided."}
            </p>
            <p className="text-[11px] text-rose-700">
              The customer is shown this reason when logging in and cannot access wholesale pricing or placing orders.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Company Corporate Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-muted block">Trading Brand Name</span>
              <span className="font-semibold text-text-primary">{company.tradingName || company.legalName || company.businessName}</span>
            </div>
            <div>
              <span className="text-text-muted block">Tax ID / EIN / GST</span>
              <span className="font-mono font-bold text-text-primary">{company.taxId || company.taxRegistrationNumber || "N/A"}</span>
            </div>
            <div>
              <span className="text-text-muted block">Registration Number</span>
              <span className="font-mono text-text-secondary">{company.registrationNumber || "N/A"}</span>
            </div>
            <div>
              <span className="text-text-muted block">Payment Terms</span>
              <span className="font-bold text-[#00875A]">{paymentTerms}</span>
            </div>
            <div>
              <span className="text-text-muted block">Primary Contact</span>
              <span className="font-medium text-text-primary">{primaryContactName}</span>
            </div>
            <div>
              <span className="text-text-muted block">Contact Email</span>
              <span className="font-medium text-text-primary">{contactEmail}</span>
            </div>
          </div>
        </div>

        {/* Business Documents */}
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Submitted Business Documentation
          </h3>
          <div className="space-y-3">
            {company.documents && company.documents.length > 0 ? (
              company.documents.map((doc) => (
                <div key={doc.id} className="p-3 rounded-lg border border-border bg-surface-muted flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                    <div>
                      <h5 className="font-semibold text-text-primary">{doc.name}</h5>
                      <span className="text-[10px] text-text-muted font-mono">{doc.type}</span>
                    </div>
                  </div>
                  <Badge variant={doc.status === "VERIFIED" ? "green" : "yellow"} size="sm">
                    {doc.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-text-muted text-xs">
                <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <span>No digital compliance documents uploaded.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive Status Change Modal */}
      <ChangeCompanyStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        company={company}
        onConfirm={({ id, status, reason }) =>
          statusMutation.mutate({ id, status, reason })
        }
        isPending={statusMutation.isPending}
      />

      {/* Dedicated Reject Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Application: ${company.legalName || company.businessName}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            <p className="text-text-muted">
              Please provide the official rejection reason. This message will be presented to the customer on their status screen.
            </p>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Tax identification number could not be validated with state revenue registry."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 resize-none font-medium"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={!rejectionReason.trim() || statusMutation.isPending}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {statusMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default CompanyReviewPage;

