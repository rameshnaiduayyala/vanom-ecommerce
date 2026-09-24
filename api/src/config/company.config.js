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
 * @param {object} [tenantOverride] Custom tenant or organization details if present.
 * @returns {typeof defaultCompanyConfig}
 */
export function getCompanyConfig(tenantOverride = null) {
  if (!tenantOverride) return defaultCompanyConfig;

  return {
    legalName: tenantOverride.legalName || defaultCompanyConfig.legalName,
    brandName: tenantOverride.brandName || tenantOverride.name || defaultCompanyConfig.brandName,
    tagline: tenantOverride.tagline || defaultCompanyConfig.tagline,
    address: tenantOverride.address || defaultCompanyConfig.address,
    phone: tenantOverride.phone || defaultCompanyConfig.phone,
    email: tenantOverride.email || defaultCompanyConfig.email,
    website: tenantOverride.website || defaultCompanyConfig.website,
    taxIds: tenantOverride.taxIds || tenantOverride.taxRegistrationNumber || defaultCompanyConfig.taxIds,
    logoUrl: tenantOverride.logoUrl || tenantOverride.logo || defaultCompanyConfig.logoUrl,
    currencyCode: tenantOverride.currencyCode || defaultCompanyConfig.currencyCode
  };
}
