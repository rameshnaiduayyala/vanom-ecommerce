/**
 * VANOM Corporate Company Details & Addresses
 * Official brand legal entity information, international office headquarters, and tax registrations.
 */

export const VANOM_COMPANY_DETAILS = {
  legalName: "VANOM Global Supply Chain & Commerce Ltd.",
  brandName: "VANOM",
  tradingName: "VANOM International Commerce",
  registrationNumber: "VN-INT-2026-98421",

  // Tax & Fiscal IDs
  taxIdentifiers: {
    US_EIN: "EIN-82-9384721",
    UK_VAT: "GB-984210984",
    IN_GSTIN: "36AABCV9842K1Z5",
  },

  // Primary Contact Channels
  contact: {
    email: "ayyalarameshnaidu@gmail.com",
    corporateEmail: "corporate.billing@vanom-global.com",
    enterpriseSupport: "enterprise@vanom-global.com",
    phone: "+91 7989419864",
    tollFreeUS: "+1 (800) 555-VANOM",
    operatingHours: "Mon – Sat, 9:00 AM – 8:00 PM IST",
    website: "https://vanom-commerce.com",
  },

  // Global Corporate Offices & Regional Warehouses
  headquarters: {
    name: "VANOM Global HQ",
    line1: "100 World Trade Center Blvd, Suite 400",
    city: "New York",
    state: "NY",
    postalCode: "10007",
    country: "United States",
    countryCode: "US",
  },

  offices: [
    {
      region: "United States",
      entity: "Vanom Logistics Inc",
      line1: "450 Lexington Avenue",
      city: "New York",
      state: "NY",
      postalCode: "10017",
      country: "United States",
      countryCode: "US",
      type: "North America Operations & Logistics",
    },
    {
      region: "Canada",
      entity: "Vanom Canada Inc",
      line1: "300 Yonge Street, Suite 1500",
      city: "Toronto",
      state: "Ontario",
      postalCode: "M5B 2L7",
      country: "Canada",
      countryCode: "CA",
      type: "North America Commercial Hub",
    }
  ],

  warehouses: [
    {
      name: "Dallas Fulfillment Center",
      country: "United States",
      city: "Dallas",
      state: "TX",
      type: "Automated Pallet & Container Depot",
    },
    {
      name: "London Logistics Depot",
      country: "United Kingdom",
      city: "London",
      state: "Tilbury Port",
      type: "Bonded Commercial Warehouse",
    },
    {
      name: "Mumbai Central Warehouse",
      country: "India",
      city: "Mumbai",
      state: "Maharashtra (JNPT Port)",
      type: "Agricultural & Raw Commodity Depot",
    },
  ],
};
