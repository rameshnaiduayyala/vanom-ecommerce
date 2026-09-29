import React from "react";
import { useCompanyProfile } from "./hooks/useCompanyProfile.js";
import { CompanyHeaderBanner } from "./components/CompanyHeaderBanner.jsx";
import { CompanyOverviewCard } from "./components/CompanyOverviewCard.jsx";
import { CompanyCreditCard } from "./components/CompanyCreditCard.jsx";
import { CompanyContactCard } from "./components/CompanyContactCard.jsx";
import { CompanyAddressCard } from "./components/CompanyAddressCard.jsx";
import { CompanyEditModal } from "./components/CompanyEditModal.jsx";

export function B2BCompanyProfilePage() {
  const {
    company,
    isLocked,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    editFormData,
    setEditFormData,
    handleUpdateSubmit,
    isUpdating,
  } = useCompanyProfile();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header Banner ── */}
      <CompanyHeaderBanner company={company} onEditClick={openEditModal} />

      {/* ── Commercial Credit & Terms ── */}
      <CompanyCreditCard company={company} />

      {/* ── Entity Identifiers & Fulfillment Routing ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompanyOverviewCard company={company} />
        <CompanyContactCard company={company} />
      </div>

      {/* ── Addresses & Warehousing ── */}
      <CompanyAddressCard company={company} />

      {/* ── Interactive Edit Modal ── */}
      <CompanyEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        formData={editFormData}
        setFormData={setEditFormData}
        onSubmit={handleUpdateSubmit}
        isUpdating={isUpdating}
        isLocked={isLocked}
      />
    </div>
  );
}

export default B2BCompanyProfilePage;
