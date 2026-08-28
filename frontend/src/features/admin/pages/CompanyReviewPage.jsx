import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
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
} from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import { ConfirmDialog } from "../../../components/ui/Alert.jsx";

export function CompanyReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { data: companiesData } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => Api.admin.getCompanies(),
  });

  const company =
    companiesData?.find((c) => c.id === id) ||
    companiesData?.[1] || {
      id: "comp-2",
      legalName: "GreenHaven Landscaping LLC",
      tradingName: "GreenHaven Landscaping",
      registrationNumber: "US-DE-987654",
      taxId: "EIN-82-9384721",
      country: "United States",
      countryCode: "US",
      status: "UNDER_REVIEW",
      creditLimit: 25000,
      paymentTerms: "NET_15",
      primaryContact: "David Miller",
      email: "david@greenhavenlandscapes.com",
      phone: "+1 214 555 0192",
      addresses: [{ line1: "742 Evergreen Terrace", city: "Dallas", state: "Texas", postalCode: "75201", country: "United States" }],
      documents: [
        { id: "doc-3", name: "IRS_W9_Form.pdf", type: "TAX_CERTIFICATE", status: "UNDER_REVIEW", uploadedAt: "2026-02-10T14:30:00Z" },
        { id: "doc-4", name: "Delaware_LLC_Registration.pdf", type: "BUSINESS_REGISTRATION", status: "UNDER_REVIEW", uploadedAt: "2026-02-10T14:32:00Z" },
      ],
    };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await Api.admin.approveApplication(company.id, "Verified by Admin Compliance Desk");
      addToast({
        title: "Wholesale Application Approved",
        message: `${company.legalName} has been approved for wholesale purchasing & NET terms.`,
        type: "success",
      });
      setApproveOpen(false);
      navigate(ROUTES.ADMIN.BUSINESS_APPLICATIONS);
    } catch (err) {
      addToast({ title: "Action Failed", message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await Api.admin.rejectApplication(company.id, "Tax document verification failed");
      addToast({
        title: "Application Rejected",
        message: `${company.legalName} has been marked as rejected.`,
        type: "error",
      });
      setRejectOpen(false);
      navigate(ROUTES.ADMIN.BUSINESS_APPLICATIONS);
    } catch (err) {
      addToast({ title: "Action Failed", message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to={ROUTES.ADMIN.BUSINESS_APPLICATIONS} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications List
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">{company.legalName}</h1>
            <Badge variant={company.status === "APPROVED" ? "green" : "yellow"} size="md">
              {company.status}
            </Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">Dossier ID: {company.id} • Registered in {company.country}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" onClick={() => setRejectOpen(true)}>
            Reject Application
          </Button>
          <Button variant="primary" size="sm" onClick={() => setApproveOpen(true)}>
            Approve Wholesale Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Company Corporate Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-muted block">Trading Brand Name</span>
              <span className="font-semibold text-text-primary">{company.tradingName}</span>
            </div>
            <div>
              <span className="text-text-muted block">Tax ID / EIN / GST</span>
              <span className="font-mono font-bold text-text-primary">{company.taxId}</span>
            </div>
            <div>
              <span className="text-text-muted block">Registration Number</span>
              <span className="font-mono text-text-secondary">{company.registrationNumber}</span>
            </div>
            <div>
              <span className="text-text-muted block">Requested Terms</span>
              <span className="font-bold text-brand-700">{company.paymentTerms}</span>
            </div>
            <div>
              <span className="text-text-muted block">Primary Contact</span>
              <span className="font-medium text-text-primary">{company.primaryContact}</span>
            </div>
            <div>
              <span className="text-text-muted block">Contact Email</span>
              <span className="font-medium text-text-primary">{company.email}</span>
            </div>
          </div>
        </div>

        {/* Business Documents */}
        <div className="p-6 rounded-xl bg-white border border-border space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Submitted Business Documentation
          </h3>
          <div className="space-y-3">
            {company.documents?.map((doc) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
        title="Approve Wholesale Company"
        description={`Are you sure you want to approve ${company.legalName}? This will grant access to B2B wholesale pricing tiers and invoice credit facility.`}
        confirmText="Yes, Approve Company"
        variant="primary"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        title="Reject Wholesale Application"
        description={`Reject application for ${company.legalName}? A formal notification will be logged.`}
        confirmText="Confirm Rejection"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
}
