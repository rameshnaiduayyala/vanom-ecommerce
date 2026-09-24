import { env } from "./env.js";

/**
 * Multi-Tenant Default Organization & Company Invoice Configuration.
 * If an order or tenant does not provide custom entity details, this configuration is used.
 */
export const defaultCompanyConfig = {
  legalName: process.env.COMPANY_LEGAL_NAME || "VANOM Global Supply Chain & Commerce Ltd.",
  brandName: process.env.COMPANY_BRAND_NAME || "VANOM",
  tagline: process.env.COMPANY_TAGLINE || "Global Wholesale & Commercial Enterprise Commerce",
  address: process.env.COMPANY_ADDRESS || "100 World Trade Center Blvd, Suite 400, New York, NY 10007, USA",
  phone: process.env.COMPANY_PHONE || "+1 (800) 555-VANOM  •  +91 7989419864",
  email: process.env.COMPANY_EMAIL || "corporate.billing@vanom-global.com",
  website: process.env.COMPANY_WEBSITE || "https://vanom-commerce.com",
  taxIds: process.env.COMPANY_TAX_IDS || "EIN: 82-9384721  •  VAT: GB-984210984  •  GSTIN: 36AABCV9842K1Z5",
  logoUrl: process.env.COMPANY_LOGO_URL || null,
  currencyCode: "USD"
};

/**
 * Resolves dynamic organization/company details for a specific order.
 * Merges priority: Custom Tenant Override > Database Store Settings > System Default
 * @param {object} [tenantOverride] Custom tenant or organization details if present.
 * @param {object} [storeSetting] Database store setting record.
 * @returns {typeof defaultCompanyConfig}
 */
export function getCompanyConfig(tenantOverride = null, storeSetting = null) {
  let baseConfig = { ...defaultCompanyConfig };

  if (storeSetting) {
    const formattedAddress = [
      storeSetting.addressLine1,
      storeSetting.addressLine2,
      storeSetting.city,
      storeSetting.state,
      storeSetting.postalCode,
      storeSetting.country
    ].filter(Boolean).join(", ");

    baseConfig = {
      ...baseConfig,
      brandName: storeSetting.storeName || baseConfig.brandName,
      legalName: storeSetting.legalName || storeSetting.storeName || baseConfig.legalName,
      tagline: storeSetting.storeTagline || baseConfig.tagline,
      address: formattedAddress || baseConfig.address,
      phone: storeSetting.phone || storeSetting.whatsapp || baseConfig.phone,
      email: storeSetting.supportEmail || storeSetting.email || baseConfig.email,
      taxIds: storeSetting.taxId 
        ? `Tax/GST: ${storeSetting.taxId}${storeSetting.businessRegistration ? ` • Reg: ${storeSetting.businessRegistration}` : ""}` 
        : baseConfig.taxIds,
      logoUrl: storeSetting.logoUrl || baseConfig.logoUrl,
      footerNote: storeSetting.invoiceFooterNote,
      invoicePrefix: storeSetting.invoicePrefix
    };
  }

  if (!tenantOverride) return baseConfig;

  return {
    ...baseConfig,
    legalName: tenantOverride.legalName || baseConfig.legalName,
    brandName: tenantOverride.brandName || tenantOverride.name || baseConfig.brandName,
    tagline: tenantOverride.tagline || baseConfig.tagline,
    address: tenantOverride.address || baseConfig.address,
    phone: tenantOverride.phone || baseConfig.phone,
    email: tenantOverride.email || baseConfig.email,
    website: tenantOverride.website || baseConfig.website,
    taxIds: tenantOverride.taxIds || tenantOverride.taxRegistrationNumber || baseConfig.taxIds,
    logoUrl: tenantOverride.logoUrl || tenantOverride.logo || baseConfig.logoUrl,
    currencyCode: tenantOverride.currencyCode || baseConfig.currencyCode,
    footerNote: tenantOverride.footerNote || baseConfig.footerNote
  };
}

