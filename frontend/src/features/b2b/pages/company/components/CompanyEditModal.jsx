import React from "react";
import { Lock, ShieldCheck, Info } from "lucide-react";
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
  isLocked = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLocked ? "Corporate Information (Verified & Locked)" : "Edit Corporate Information & Compliance Details"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {isLocked && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Verified Commercial Entity (Locked)</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                This business account has been approved and KYC-verified. To preserve tax audit compliance and commercial contracts, legal entity details (Business Name, Tax/GSTIN, CIN, Jurisdiction, and Registered Address) are locked. To request changes, please contact compliance support.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label={`Legal Business Name ${isLocked ? "(Locked)" : ""}`}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Apex Global Wholesale Traders Pvt Ltd"
              disabled={isLocked}
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
            label={`Country Code (ISO) ${isLocked ? "(Locked)" : ""}`}
            value={formData.countryCode}
            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
            placeholder="e.g. US, IN, CA"
            disabled={isLocked}
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
            placeholder="+1 800 555 1234"
            required
          />

          <Input
            label={`Tax Registration / GSTIN / VAT ${isLocked ? "(Locked)" : ""}`}
            value={formData.taxRegistrationNumber}
            onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
            placeholder="e.g. 27AAACA1234A1Z1"
            disabled={isLocked}
          />

          <Input
            label={`Company Registration (CIN) ${isLocked ? "(Locked)" : ""}`}
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            placeholder="e.g. U74999MH2021PTC123456"
            disabled={isLocked}
          />

          <div className="sm:col-span-2">
            <Textarea
              label={`Registered Corporate & Billing Address ${isLocked ? "(Locked)" : ""}`}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot / Street, Industrial Estate, City, State, Postal Code"
              rows={3}
              disabled={isLocked}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            {isLocked ? "Close" : "Cancel"}
          </Button>
          {!isLocked && (
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdating}
              className="font-bold bg-[#204B38] hover:bg-[#18392B]"
            >
              Save Changes
            </Button>
          )}
          {isLocked && (
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdating}
              className="font-bold bg-[#204B38] hover:bg-[#18392B]"
            >
              Update Contact Info
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default CompanyEditModal;
