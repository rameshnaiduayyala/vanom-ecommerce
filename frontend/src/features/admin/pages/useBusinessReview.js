import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useUIStore } from "../../../stores/ui.store.js";

/**
 * Encapsulates all data-fetching mutations for business application review.
 * Keeps BusinessApplications.jsx focused purely on rendering.
 */
export function useBusinessReviewMutations({ onApproveSuccess, onRejectSuccess }) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }) => Api.admin.approveApplication(id, notes),
    onSuccess: () => {
      invalidate();
      addToast({
        title: "Company Approved",
        message: "The B2B business account has been approved for wholesale ordering.",
        type: "success",
      });
      onApproveSuccess?.();
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
    mutationFn: ({ id, reason }) => Api.admin.rejectApplication(id, reason),
    onSuccess: () => {
      invalidate();
      addToast({
        title: "Company Application Rejected",
        message: "The application has been rejected and status updated.",
        type: "error",
      });
      onRejectSuccess?.();
    },
    onError: (err) => {
      addToast({
        title: "Rejection Failed",
        message: err.message || "Failed to reject company application",
        type: "error",
      });
    },
  });

  return { approveMutation, rejectMutation };
}

/**
 * Filters the flat company list by search term and status tab.
 *
 * @param {object[]} companies
 * @param {string} searchTerm
 * @param {string} statusFilter  - "ALL" | "PENDING" | "APPROVED" | "REJECTED"
 */
export function filterCompanies(companies, searchTerm, statusFilter) {
  return companies.filter((comp) => {
    const legalName = (comp.legalName || "").toLowerCase();
    const tradingName = (comp.tradingName || "").toLowerCase();
    const taxId = (comp.taxId || "").toLowerCase();
    const country = (comp.country?.name || comp.countryCode || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      legalName.includes(query) ||
      tradingName.includes(query) ||
      taxId.includes(query) ||
      country.includes(query);

    const compStatus = String(comp.status || "PENDING").toUpperCase();
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" &&
        (compStatus === "PENDING" || compStatus === "UNDER_REVIEW")) ||
      compStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });
}
