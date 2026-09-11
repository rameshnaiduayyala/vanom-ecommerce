import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { useAdminCompanies } from "./hooks/useAdminCompanies.js";
import { CompaniesTable } from "./components/CompaniesTable.jsx";
import { CompaniesFilter } from "./components/CompaniesFilter.jsx";
import { CompanyFormModal } from "./components/CompanyFormModal.jsx";
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

  const handleFormSubmit = async (formData) => {
    setFormError("");

    if (!formData.legalName && !formData.businessName) {
      setFormError("Legal name or brand name is required.");
      return;
    }

    const payload = {
      legalName: formData.legalName || formData.businessName,
      businessName: formData.businessName || formData.legalName,
      tradingName: formData.businessName || formData.legalName,
      registrationNumber: formData.registrationNumber,
      taxId: formData.taxId,
      countryCode: formData.countryCode,
      status: formData.status,
      paymentTermsDays: Number(formData.paymentTermsDays || 0),
      creditLimit: Number(formData.creditLimit || 0),
      address: {
        line1: formData.addressLine1 || "Business Address",
        line2: formData.addressLine2 || "",
        city: formData.city || "City",
        state: formData.state || "State",
        postalCode: formData.postalCode || "000000",
        phone: formData.phone || "",
      },
    };

    if (!editingCompany && formData.adminEmail) {
      payload.adminUser = {
        firstName: formData.adminFirstName,
        lastName: formData.adminLastName,
        email: formData.adminEmail,
        password: formData.adminPassword || "Password123!",
        phone: formData.adminPhone || formData.phone,
      };
    }

    try {
      if (editingCompany) {
        await updateMutation.mutateAsync({ id: editingCompany.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setFormModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save corporate entity.");
    }
  };

  const handleDeleteConfirm = async (companyId) => {
    try {
      await deleteMutation.mutateAsync(companyId);
      setDeleteConfirmCompany(null);
    } catch {
      // Error handled by mutation toast
    }
  };

  // Filtered Companies
  const filteredCompanies = companies.filter((c) => {
    const legalName = (c.legalName || "").toLowerCase();
    const tradingName = (c.tradingName || "").toLowerCase();
    const taxId = (c.taxId || "").toLowerCase();
    const regNo = (c.registrationNumber || "").toLowerCase();
    const country = (c.country?.name || c.country?.code || "").toLowerCase();

    const matchesSearch =
      !searchTerm ||
      legalName.includes(searchTerm.toLowerCase()) ||
      tradingName.includes(searchTerm.toLowerCase()) ||
      taxId.includes(searchTerm.toLowerCase()) ||
      regNo.includes(searchTerm.toLowerCase()) ||
      country.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      String(c.status || "PENDING").toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
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
        onEdit={handleOpenEdit}
        onDelete={setDeleteConfirmCompany}
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
