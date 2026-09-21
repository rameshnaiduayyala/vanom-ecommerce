import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useAuthStore } from "@/stores/auth.store.js";
import { toast } from "@/components/ui/Toast.jsx";

export function useCompanyProfile() {
  const queryClient = useQueryClient();
  const { user, activeCompany, setActiveCompany } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    businessName: "",
    contactPersonName: "",
    businessEmail: "",
    businessPhone: "",
    address: "",
    taxRegistrationNumber: "",
    registrationNumber: "",
  });

  // Query live company data from backend API
  const { data: remoteCompany, isLoading, isError, refetch } = useQuery({
    queryKey: ["b2b-company-profile"],
    queryFn: async () => {
      try {
        const res = await Api.b2b.getCompany();
        if (res?.data) return res.data;
        if (res) return res;
      } catch (err) {
        console.warn("Could not fetch /bulk/business/me", err);
      }
      return null;
    },
  });

  // Live company from backend or current session store (no hardcoded fallback)
  const company = remoteCompany || activeCompany || user?.bulkBusiness || user?.business || null;

  useEffect(() => {
    if (company) {
      setEditFormData({
        businessName: company.businessName || company.legalName || "",
        contactPersonName: company.contactPersonName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        businessEmail: company.businessEmail || company.email || user?.email || "",
        businessPhone: company.businessPhone || company.phone || user?.phone || "",
        address: typeof company.address === "string" ? company.address : `${company.address?.line1 || ""}, ${company.address?.city || ""}`.trim(),
        taxRegistrationNumber: company.taxRegistrationNumber || company.taxId || "",
        registrationNumber: company.registrationNumber || "",
      });
    }
  }, [company, user]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => Api.b2b.updateCompany(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["b2b-company-profile"] });
      const newCompanyData = updated?.data || updated || (company ? { ...company, ...editFormData } : editFormData);
      setActiveCompany(newCompanyData);
      toast.success("Profile Updated", "Company information has been saved successfully.");
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      toast.error("Update Failed", err.message || "Failed to update company profile.");
    },
  });

  const handleUpdateSubmit = (e) => {
    if (e) e.preventDefault();
    updateMutation.mutate({
      businessName: editFormData.businessName?.trim(),
      contactPersonName: editFormData.contactPersonName?.trim(),
      businessEmail: editFormData.businessEmail?.trim(),
      businessPhone: editFormData.businessPhone?.trim(),
      address: editFormData.address?.trim(),
      taxRegistrationNumber: editFormData.taxRegistrationNumber?.trim() || null,
      registrationNumber: editFormData.registrationNumber?.trim() || null,
    });
  };

  return {
    company,
    user,
    isLoading,
    isError,
    refetch,
    isEditModalOpen,
    setIsEditModalOpen,
    editFormData,
    setEditFormData,
    openEditModal: () => setIsEditModalOpen(true),
    closeEditModal: () => setIsEditModalOpen(false),
    handleUpdateSubmit,
    isUpdating: updateMutation.isPending,
  };
}
