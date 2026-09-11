import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, UserPlus } from "lucide-react";
import { Button } from "../../../../components/ui/Button.jsx";
import { useAdminUsers } from "./hooks/useAdminUsers.js";
import { UsersTable } from "./components/UsersTable.jsx";
import { UsersFilter } from "./components/UsersFilter.jsx";
import { UserFormModal } from "./components/UserFormModal.jsx";
import { ViewUserModal } from "./components/ViewUserModal.jsx";
import { DeleteUserModal } from "./components/DeleteUserModal.jsx";

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    users,
    companies,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditingUser(null);
      setFormError("");
      setFormModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormError("");
    setFormModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormError("");
    setFormModalOpen(true);
  };

  const handleOpenView = (user) => {
    setViewingUser(user);
  };

  const handleFormSubmit = async (formData, b2bCompanyMode) => {
    setFormError("");

    if (!formData.email) {
      setFormError("Email is required.");
      return;
    }

    if (!editingUser && !formData.password) {
      setFormError("Password is required for new users.");
      return;
    }

    if (formData.customerType === "B2B" && !editingUser && b2bCompanyMode === "NEW") {
      if (!formData.newCompanyLegalName && !formData.newCompanyName) {
        setFormError("Please provide the legal or trading business name for the new company.");
        return;
      }
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      customerType: formData.customerType,
      status: formData.status,
      roles: [formData.role],
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    if (formData.customerType === "B2B") {
      if (b2bCompanyMode === "EXISTING" && formData.companyId) {
        payload.companyId = formData.companyId;
      } else if (b2bCompanyMode === "NEW") {
        payload.newCompany = {
          legalName: formData.newCompanyLegalName || formData.newCompanyName,
          businessName: formData.newCompanyName || formData.newCompanyLegalName,
          taxId: formData.newCompanyTaxId,
          registrationNumber: formData.newCompanyRegNo,
          countryCode: formData.newCompanyCountryCode,
          addressLine1: formData.newCompanyAddressLine1,
          city: formData.newCompanyCity,
          state: formData.newCompanyState,
          postalCode: formData.newCompanyPostalCode,
          status: "APPROVED",
        };
      }
    }

    try {
      if (editingUser) {
        await updateMutation.mutateAsync({ id: editingUser.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setFormModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save user.");
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirmUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const nameMatch =
      `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company?.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company?.tradingName?.toLowerCase().includes(searchTerm.toLowerCase());

    const roles = Array.isArray(u.roles) ? u.roles : [u.roles || "CUSTOMER"];
    const roleMatch = roleFilter === "ALL" || roles.includes(roleFilter);
    const statusMatch = statusFilter === "ALL" || u.status === statusFilter;

    return nameMatch && roleMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <User className="w-6 h-6 text-[#00875A]" />
            User Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage system administrators, retail customers, and commercial B2B buyer accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAdd}
            className="bg-[#00875A] hover:bg-[#00734D] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </Button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <UsersFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* ─── Users Table ─── */}
      <UsersTable
        users={filteredUsers}
        isLoading={isLoading}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={setDeleteConfirmUser}
      />

      {/* ─── View User Modal ─── */}
      <ViewUserModal
        isOpen={Boolean(viewingUser)}
        user={viewingUser}
        onClose={() => setViewingUser(null)}
        onEdit={handleOpenEdit}
      />

      {/* ─── Add / Edit Modal ─── */}
      <UserFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editingUser={editingUser}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        formError={formError}
        companies={companies}
      />

      {/* ─── Delete Confirmation Modal ─── */}
      <DeleteUserModal
        isOpen={!!deleteConfirmUser}
        user={deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

export default AdminUsersPage;
