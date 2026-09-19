import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { useAdminCompanies } from "./hooks/useAdminCompanies.js";
import { CompaniesTable } from "./components/CompaniesTable.jsx";
import { CompaniesFilter } from "./components/CompaniesFilter.jsx";
import { CompanyFormModal } from "./components/CompanyFormModal.jsx";
import { ViewCompanyModal } from "./components/ViewCompanyModal.jsx";
import { DeleteCompanyModal } from "./components/DeleteCompanyModal.jsx";

export function AdminCompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    companies,
    countries,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminCompanies();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [deleteConfirmCompany, setDeleteConfirmCompany] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditingCompany(null);
      setFormError("");
      setFormModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormError("");
    setFormModalOpen(true);
  };

  const handleOpenEdit = (company) => {
    setEditingCompany(company);
    setFormError("");
    setFormModalOpen(true);
  };

  const handleOpenView = (company) => {
    setViewingCompany(company);
  };

  const handleFormSubmit = async (formData) => {
    setFormError("");

    if (!formData.businessName) {
      setFormError("Business name is required.");
      return;
    }

    const payload = {
      businessName: formData.businessName.trim(),
      businessEmail: formData.businessEmail.trim().toLowerCase(),
      businessPhone: formData.businessPhone.trim(),
      contactPersonName: formData.contactPersonName.trim(),
      countryCode: formData.countryCode.toUpperCase(),
      taxRegistrationNumber: formData.taxRegistrationNumber ? formData.taxRegistrationNumber.trim() : null,
      registrationNumber: formData.registrationNumber ? formData.registrationNumber.trim() : null,
      address: formData.address.trim(),
      status: formData.status,
    };

    try {
      if (editingCompany) {
        await updateMutation.mutateAsync({ id: editingCompany.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setFormModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save business entity.";
      setFormError(msg);
    }
  };

  const handleDeleteConfirm = async (companyId) => {
    try {
      await deleteMutation.mutateAsync(companyId);
      setDeleteConfirmCompany(null);
    } catch {
      // Handled in mutation
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchTerm.toLowerCase();
    const nameMatch =
      (c.businessName || "").toLowerCase().includes(q) ||
      (c.businessEmail || "").toLowerCase().includes(q) ||
      (c.businessPhone || "").toLowerCase().includes(q) ||
      (c.contactPersonName || "").toLowerCase().includes(q) ||
      (c.taxRegistrationNumber || "").toLowerCase().includes(q) ||
      (c.registrationNumber || "").toLowerCase().includes(q) ||
      (c.countryCode || "").toLowerCase().includes(q);

    const statusMatch = statusFilter === "ALL" || c.status === statusFilter;

    return nameMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#00875A]" />
            Corporate Entities (B2B)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage wholesale companies, legal profiles, payment terms, and credit account limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAdd}
            className="bg-[#00875A] hover:bg-[#00734D] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            Register Company
          </Button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <CompaniesFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* ─── Companies Table ─── */}
      <CompaniesTable
        companies={filteredCompanies}
        isLoading={isLoading}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={setDeleteConfirmCompany}
      />

      {/* ─── View Company Modal ─── */}
      <ViewCompanyModal
        isOpen={Boolean(viewingCompany)}
        company={viewingCompany}
        onClose={() => setViewingCompany(null)}
        onEdit={handleOpenEdit}
      />

      {/* ─── Add / Edit Modal ─── */}
      <CompanyFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editingCompany={editingCompany}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        formError={formError}
        countries={countries}
      />

      {/* ─── Delete Confirmation Modal ─── */}
      <DeleteCompanyModal
        isOpen={!!deleteConfirmCompany}
        company={deleteConfirmCompany}
        onClose={() => setDeleteConfirmCompany(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminCompaniesPage;
