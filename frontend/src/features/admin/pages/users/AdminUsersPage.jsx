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
      role: formData.role || "USER",
      isActive: formData.isActive ?? true,
      countryId: formData.countryId || null,
    };

    if (formData.password) {
      payload.password = formData.password;
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
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const company = (
      u.bulkBusiness?.businessName ||
      u.bulkBusiness?.companyName ||
      u.company?.legalName ||
      ""
    ).toLowerCase();
    const country = (u.country?.name || u.country?.code || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    const nameMatch =
      fullName.includes(term) ||
      email.includes(term) ||
      company.includes(term) ||
      country.includes(term);

    // Role Match
    let roleMatch = true;
    if (roleFilter === "SUPERADMIN") {
      roleMatch = u.role === "SUPERADMIN";
    } else if (roleFilter === "USER") {
      roleMatch = u.role === "USER" && !u.bulkBusiness;
    } else if (roleFilter === "B2B") {
      roleMatch = Boolean(u.bulkBusiness);
    }

    // Status Match
    let statusMatch = true;
    if (statusFilter === "ACTIVE") {
      statusMatch = (u.isActive ?? true) === true;
    } else if (statusFilter === "INACTIVE") {
      statusMatch = (u.isActive ?? true) === false;
    }

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
