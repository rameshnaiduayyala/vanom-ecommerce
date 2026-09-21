import React from "react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";

export function CompanyEditModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isUpdating,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Corporate Information"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Legal Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Apex Global Wholesale Traders Pvt Ltd"
              required
            />
          </div>

          <Input
            label="Primary Procurement Representative"
            value={formData.contactPersonName}
            onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
            placeholder="Full Name"
            required
          />

          <Input
            label="Official Business Email"
            type="email"
            value={formData.businessEmail}
            onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
            placeholder="procurement@company.com"
            required
          />

          <Input
            label="Business Phone Number"
            value={formData.businessPhone}
            onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
            placeholder="+91 98200 12345"
            required
          />

          <Input
            label="Tax Registration Number / GSTIN"
            value={formData.taxRegistrationNumber}
            onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
            placeholder="e.g. 27AAACA1234A1Z1"
          />

          <div className="sm:col-span-2">
            <Textarea
              label="Registered Corporate & Billing Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot / Street, Industrial Estate, City, State, Postal Code"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isUpdating}
            className="font-bold bg-[#204B38] hover:bg-[#18392B]"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CompanyEditModal;
