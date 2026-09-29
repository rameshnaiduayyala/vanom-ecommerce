import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useUIStore } from "@/stores/ui.store.js";

export function useAdminCompanies() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const companiesQuery = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => Api.admin.getCompanies(),
  });

  const countriesQuery = useQuery({
    queryKey: ["geography-countries"],
    queryFn: () => Api.geography.getCountries(),
  });

  const createMutation = useMutation({
    mutationFn: (companyData) => Api.admin.createCompany(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      addToast({
        title: "Company Registered",
        message: "New B2B corporate entity registered successfully.",
        type: "success",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      addToast({
        title: "Company Updated",
        message: "Corporate entity details updated successfully.",
        type: "success",
      });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason, isLocked }) => {
      const statusRes = await Api.admin.changeStatus(id, status, reason);
      if (isLocked !== undefined) {
        await Api.b2b.lockAdminBusiness(id, isLocked);
      }
      return statusRes;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      addToast({
        title: "Compliance Review Updated",
        message: `Status set to ${variables.status} and profile is ${variables.isLocked ? "locked" : "unlocked"}.`,
        type: variables.status === "APPROVED" ? "success" : variables.status === "REJECTED" ? "error" : "info",
      });
    },
    onError: (err) => {
      addToast({
        title: "Action Failed",
        message: err.message || "Failed to update business compliance review.",
        type: "error",
      });
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: ({ id, isLocked }) => Api.b2b.lockAdminBusiness(id, isLocked),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      addToast({
        title: variables.isLocked ? "Company Profile Locked" : "Company Profile Unlocked",
        message: `Business profile is now ${variables.isLocked ? "locked from buyer modifications" : "unlocked for edits"}.`,
        type: "success",
      });
    },
    onError: (err) => {
      addToast({
        title: "Lock Toggle Failed",
        message: err.message || "Failed to update lock status.",
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      addToast({
        title: "Company Deleted",
        message: "Corporate entity removed from database.",
        type: "success",
      });
    },
    onError: (err) => {
      addToast({
        title: "Delete Failed",
        message: err.message || "Could not delete corporate entity.",
        type: "error",
      });
    },
  });

  const companies = Array.isArray(companiesQuery.data)
    ? companiesQuery.data
    : Array.isArray(companiesQuery.data?.items)
    ? companiesQuery.data.items
    : [];

  const countries = Array.isArray(countriesQuery.data) ? countriesQuery.data : [];

  return {
    companies,
    countries,
    isLoading: companiesQuery.isLoading,
    createMutation,
    updateMutation,
    changeStatusMutation,
    toggleLockMutation,
    deleteMutation,
  };
}
