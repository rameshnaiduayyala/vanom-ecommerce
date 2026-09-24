import React, { useState, useEffect } from "react";
import {
  Store,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Sliders,
  Share2,
  Save,
  RotateCcw,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Info,
  DollarSign,
  Truck,
  Percent,
  Layers,
  Sparkles,
} from "lucide-react";
import { storeService } from "@/services/api/store.service.js";
import { uploadService } from "@/services/api/upload.service.js";
import { toast } from "@/stores/ui.store.js";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import { Badge } from "@/components/ui/Badge.jsx";

const DEFAULT_STORE_DATA = {
  storeName: "Vanom",
  storeTagline: "Premium eCommerce Platform",
  description: "Your one-stop enterprise and retail destination.",
  logoUrl: "",
  darkLogoUrl: "",
  faviconUrl: "",
  email: "",
  supportEmail: "",
  phone: "",
  whatsapp: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  taxId: "",
  businessRegistration: "",
  legalName: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  isMaintenanceMode: false,
  maintenanceMessage: "We are currently performing routine maintenance. Please check back shortly.",
  announcementBarText: "🎉 Welcome to Vanom! Free shipping on bulk orders.",
  isAnnouncementActive: false,
  defaultCurrency: "USD",
  lowStockThreshold: 5,
  freeShippingThreshold: "",
  standardShippingFee: "",
  taxRatePercentage: "",
  invoicePrefix: "INV-",
  invoiceFooterNote: "Thank you for doing business with us.",
};

export function AdminStoreSettingsPage() {
  const [formData, setFormData] = useState(DEFAULT_STORE_DATA);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      setLoading(true);
      const data = await storeService.getStoreSettings();
      if (data) {
        setFormData({
          ...DEFAULT_STORE_DATA,
          ...data,
          freeShippingThreshold: data.freeShippingThreshold ?? "",
          standardShippingFee: data.standardShippingFee ?? "",
          taxRatePercentage: data.taxRatePercentage ?? "",
        });
      }
    } catch (error) {
      toast.error("Failed to load store settings", error?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldName);
      const res = await uploadService.upload(file, "store");
      const uploadedUrl = res?.storageKey || res?.url || res?.data?.url;
      if (uploadedUrl) {
        handleInputChange(fieldName, uploadedUrl);
        toast.success("Image Uploaded", `${fieldName} updated successfully.`);
      }
    } catch (err) {
      toast.error("Upload Failed", err?.message || "Could not upload file.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        freeShippingThreshold: formData.freeShippingThreshold === "" ? null : Number(formData.freeShippingThreshold),
        standardShippingFee: formData.standardShippingFee === "" ? null : Number(formData.standardShippingFee),
        taxRatePercentage: formData.taxRatePercentage === "" ? null : Number(formData.taxRatePercentage),
        lowStockThreshold: Number(formData.lowStockThreshold) || 5,
      };

      const updated = await storeService.updateStoreSettings(payload);
      if (updated) {
        setFormData((prev) => ({
          ...prev,
          ...updated,
        }));
      }
      toast.success("Store Settings Saved", "Global store details and settings updated successfully.");
    } catch (err) {
      toast.error("Save Failed", err?.message || "Failed to update store settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReset = async () => {
    try {
      setDeleting(true);
      await storeService.deleteStoreSettings();
      setShowDeleteModal(false);
      toast.success("Store Settings Reset", "Store details have been reset to system defaults.");
      await fetchStoreSettings();
    } catch (err) {
      toast.error("Action Failed", err?.message || "Could not reset store settings.");
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: "general", label: "General & Branding", icon: Store },
    { id: "contact", label: "Contact & Location", icon: MapPin },
    { id: "legal", label: "Legal & Invoicing", icon: FileText },
    { id: "operations", label: "Storefront & Rules", icon: Sliders },
    { id: "social", label: "Social Media", icon: Share2 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-inner">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Store Settings</h1>
              <Badge variant="success" className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                Superadmin Only
              </Badge>
              <Badge variant="outline" className="border-slate-300 text-slate-600 text-[11px]">
                Single Store
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your store identity, contact info, taxes, shipping defaults, and storefront status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-3 py-2"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Store
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4 py-2 font-medium shadow-sm flex items-center gap-1.5"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab 1: General & Branding ─── */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Store className="w-4 h-4 text-emerald-600" />
              Store Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Store Name *"
                placeholder="e.g. Vanom"
                value={formData.storeName || ""}
                onChange={(e) => handleInputChange("storeName", e.target.value)}
                required
              />
              <Input
                label="Store Tagline"
                placeholder="e.g. The modern commerce ecosystem"
                value={formData.storeTagline || ""}
                onChange={(e) => handleInputChange("storeTagline", e.target.value)}
              />
            </div>

            <Textarea
              label="Store Description"
              placeholder="Brief summary of your business shown on SEO and about pages..."
              rows={3}
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Brand Assets & Logos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Logo */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Primary Logo (Light BG)</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center relative group min-h-[140px]">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="max-h-20 object-contain mb-2 rounded"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-400 mb-1" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "logoUrl")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    {uploadingField === "logoUrl" ? "Uploading..." : "Click to upload primary logo"}
                  </p>
                </div>
                <Input
                  placeholder="Or enter logo URL..."
                  value={formData.logoUrl || ""}
                  onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Dark Mode Logo */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Dark Mode Logo (Dark BG)</label>
                <div className="border border-dashed border-slate-700 rounded-xl p-4 bg-slate-900 flex flex-col items-center justify-center text-center relative group min-h-[140px]">
                  {formData.darkLogoUrl ? (
                    <img
                      src={formData.darkLogoUrl}
                      alt="Dark Logo"
                      className="max-h-20 object-contain mb-2 rounded"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500 mb-1" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "darkLogoUrl")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">
                    {uploadingField === "darkLogoUrl" ? "Uploading..." : "Click to upload dark logo"}
                  </p>
                </div>
                <Input
                  placeholder="Or enter dark logo URL..."
                  value={formData.darkLogoUrl || ""}
                  onChange={(e) => handleInputChange("darkLogoUrl", e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Favicon (Browser Tab Icon)</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center relative group min-h-[140px]">
                  {formData.faviconUrl ? (
                    <img
                      src={formData.faviconUrl}
                      alt="Favicon"
                      className="w-10 h-10 object-contain mb-2 rounded"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-400 mb-1" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "faviconUrl")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    {uploadingField === "faviconUrl" ? "Uploading..." : "Click to upload favicon"}
                  </p>
                </div>
                <Input
                  placeholder="Or enter favicon URL..."
                  value={formData.faviconUrl || ""}
                  onChange={(e) => handleInputChange("faviconUrl", e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 2: Contact & Location ─── */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Mail className="w-4 h-4 text-emerald-600" />
              Communication Channels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Primary Business Email"
                placeholder="contact@vanom.com"
                type="email"
                icon={Mail}
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              <Input
                label="Customer Support Email"
                placeholder="support@vanom.com"
                type="email"
                icon={Mail}
                value={formData.supportEmail || ""}
                onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              />
              <Input
                label="Telephone / Support Phone"
                placeholder="+1 (555) 019-2834"
                icon={Phone}
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
              <Input
                label="WhatsApp Business Number"
                placeholder="+15550192834"
                icon={Phone}
                value={formData.whatsapp || ""}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Registered Business Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <Input
                  label="Address Line 1"
                  placeholder="Street Address, Building, Suite"
                  value={formData.addressLine1 || ""}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Address Line 2 (Optional)"
                  placeholder="Apartment, Floor, Landmark"
                  value={formData.addressLine2 || ""}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                />
              </div>
              <Input
                label="City"
                placeholder="e.g. San Francisco"
                value={formData.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
              <Input
                label="State / Province"
                placeholder="e.g. California"
                value={formData.state || ""}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
              <Input
                label="Postal / Zip Code"
                placeholder="e.g. 94103"
                value={formData.postalCode || ""}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
              />
              <Input
                label="Country"
                placeholder="e.g. United States"
                value={formData.country || ""}
                onChange={(e) => handleInputChange("country", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 3: Legal & Invoicing ─── */}
      {activeTab === "legal" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              Legal & Tax Identifiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input
                label="Legal Entity Name"
                placeholder="Vanom Enterprise Corp."
                value={formData.legalName || ""}
                onChange={(e) => handleInputChange("legalName", e.target.value)}
              />
              <Input
                label="Tax Identification / GSTIN / VAT"
                placeholder="e.g. GSTIN27AABCU9603R1ZM"
                value={formData.taxId || ""}
                onChange={(e) => handleInputChange("taxId", e.target.value)}
              />
              <Input
                label="Business Registration Number"
                placeholder="e.g. CRN-90218841"
                value={formData.businessRegistration || ""}
                onChange={(e) => handleInputChange("businessRegistration", e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-emerald-600" />
              Invoice Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Invoice Prefix"
                placeholder="e.g. INV-"
                value={formData.invoicePrefix || ""}
                onChange={(e) => handleInputChange("invoicePrefix", e.target.value)}
                helperText="Prepended to all generated customer & B2B invoice numbers."
              />
              <Input
                label="Default Tax Rate (%)"
                type="number"
                step="0.01"
                placeholder="18.00"
                icon={Percent}
                value={formData.taxRatePercentage || ""}
                onChange={(e) => handleInputChange("taxRatePercentage", e.target.value)}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Invoice Footer Note / Terms"
                  placeholder="e.g. Goods once sold will not be returned. Interest @18% p.a. charged after due date."
                  rows={3}
                  value={formData.invoiceFooterNote || ""}
                  onChange={(e) => handleInputChange("invoiceFooterNote", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 4: Storefront & Operations ─── */}
      {activeTab === "operations" && (
        <div className="space-y-6">
          {/* Maintenance & Announcement Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Mode */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Maintenance Mode
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Temporarily pause public checkout & display maintenance banner.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isMaintenanceMode || false}
                  onChange={(e) => handleInputChange("isMaintenanceMode", e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <Textarea
                label="Maintenance Message"
                rows={2}
                value={formData.maintenanceMessage || ""}
                onChange={(e) => handleInputChange("maintenanceMessage", e.target.value)}
                placeholder="Message shown to customers during maintenance..."
              />
            </div>

            {/* Announcement Banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Top Announcement Bar
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Display a persistent banner on top of the storefront.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isAnnouncementActive || false}
                  onChange={(e) => handleInputChange("isAnnouncementActive", e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <Textarea
                label="Announcement Text"
                rows={2}
                value={formData.announcementBarText || ""}
                onChange={(e) => handleInputChange("announcementBarText", e.target.value)}
                placeholder="e.g. Free shipping on all orders above $100!"
              />
            </div>
          </div>

          {/* Operational Defaults */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Operational Defaults & Thresholds
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Default Currency Code"
                placeholder="USD"
                value={formData.defaultCurrency || "USD"}
                onChange={(e) => handleInputChange("defaultCurrency", e.target.value.toUpperCase())}
                helperText="e.g. USD, EUR, INR, GBP"
              />

              <Input
                label="Low Stock Alert Threshold"
                type="number"
                placeholder="5"
                icon={Layers}
                value={formData.lowStockThreshold || ""}
                onChange={(e) => handleInputChange("lowStockThreshold", e.target.value)}
                helperText="Triggers low stock badge on products."
              />

              <Input
                label="Free Shipping Minimum"
                type="number"
                step="0.01"
                placeholder="100.00"
                icon={Truck}
                value={formData.freeShippingThreshold || ""}
                onChange={(e) => handleInputChange("freeShippingThreshold", e.target.value)}
                helperText="Orders above qualify for free shipping."
              />

              <Input
                label="Standard Shipping Fee"
                type="number"
                step="0.01"
                placeholder="15.00"
                icon={DollarSign}
                value={formData.standardShippingFee || ""}
                onChange={(e) => handleInputChange("standardShippingFee", e.target.value)}
                helperText="Default fee if minimum not reached."
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 5: Social Media Links ─── */}
      {activeTab === "social" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Share2 className="w-4 h-4 text-emerald-600" />
            Social Media & Web Profiles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/vanom"
              value={formData.instagramUrl || ""}
              onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
            />
            <Input
              label="Facebook URL"
              placeholder="https://facebook.com/vanom"
              value={formData.facebookUrl || ""}
              onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
            />
            <Input
              label="Twitter / X URL"
              placeholder="https://x.com/vanom"
              value={formData.twitterUrl || ""}
              onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
            />
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/company/vanom"
              value={formData.linkedinUrl || ""}
              onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
            />
            <div className="md:col-span-2">
              <Input
                label="YouTube Channel URL"
                placeholder="https://youtube.com/@vanom"
                value={formData.youtubeUrl || ""}
                onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Reset / Delete Confirmation Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Reset Store Settings?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will delete and reset all custom store configurations, logos, and business details back to default values.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 text-xs"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteReset}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                {deleting ? "Resetting..." : "Yes, Reset Store"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStoreSettingsPage;
