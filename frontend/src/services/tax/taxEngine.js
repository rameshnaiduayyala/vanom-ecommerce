/**
 * Autonomous Local Tax Engine Dataset & Calculator.
 * Maintains regional tax rates, jurisdictions, tax codes, and calculation rules.
 * Fully decoupled so external services (e.g. TaxJar, Avalara, Stripe Tax) can be plugged in later.
 */

export const TAX_DATASET = {
  // United States Sales Tax Rates by State (State + Avg Local)
  US: {
    defaultRate: 0.07,
    name: "Sales Tax",
    states: {
      AL: { rate: 0.0924, name: "Alabama Sales Tax", hasExemptions: false },
      AK: { rate: 0.0176, name: "Alaska Local Sales Tax", hasExemptions: true },
      AZ: { rate: 0.0837, name: "Arizona TPT Tax", hasExemptions: false },
      AR: { rate: 0.0947, name: "Arkansas Sales Tax", hasExemptions: false },
      CA: { rate: 0.0882, name: "California Combined Sales Tax", hasExemptions: true },
      CO: { rate: 0.0777, name: "Colorado Sales Tax", hasExemptions: false },
      CT: { rate: 0.0635, name: "Connecticut Sales Tax", hasExemptions: false },
      DE: { rate: 0.0000, name: "Delaware Zero Sales Tax", hasExemptions: true },
      FL: { rate: 0.0702, name: "Florida Sales Tax", hasExemptions: false },
      GA: { rate: 0.0735, name: "Georgia Sales Tax", hasExemptions: false },
      HI: { rate: 0.0444, name: "Hawaii General Excise Tax", hasExemptions: false },
      ID: { rate: 0.0603, name: "Idaho Sales Tax", hasExemptions: false },
      IL: { rate: 0.0881, name: "Illinois Sales Tax", hasExemptions: false },
      IN: { rate: 0.0700, name: "Indiana Sales Tax", hasExemptions: false },
      IA: { rate: 0.0694, name: "Iowa Sales Tax", hasExemptions: false },
      KS: { rate: 0.0870, name: "Kansas Sales Tax", hasExemptions: false },
      KY: { rate: 0.0600, name: "Kentucky Sales Tax", hasExemptions: false },
      LA: { rate: 0.0955, name: "Louisiana Sales Tax", hasExemptions: false },
      ME: { rate: 0.0550, name: "Maine Sales Tax", hasExemptions: false },
      MD: { rate: 0.0600, name: "Maryland Sales Tax", hasExemptions: false },
      MA: { rate: 0.0625, name: "Massachusetts Sales Tax", hasExemptions: false },
      MI: { rate: 0.0600, name: "Michigan Sales Tax", hasExemptions: false },
      MN: { rate: 0.0749, name: "Minnesota Sales Tax", hasExemptions: false },
      MS: { rate: 0.0707, name: "Mississippi Sales Tax", hasExemptions: false },
      MO: { rate: 0.0830, name: "Missouri Sales Tax", hasExemptions: false },
      MT: { rate: 0.0000, name: "Montana Zero Sales Tax", hasExemptions: true },
      NE: { rate: 0.0694, name: "Nebraska Sales Tax", hasExemptions: false },
      NV: { rate: 0.0823, name: "Nevada Sales Tax", hasExemptions: false },
      NH: { rate: 0.0000, name: "New Hampshire Zero Sales Tax", hasExemptions: true },
      NJ: { rate: 0.06625, name: "New Jersey Sales Tax", hasExemptions: false },
      NM: { rate: 0.0772, name: "New Mexico Gross Receipts Tax", hasExemptions: false },
      NY: { rate: 0.0852, name: "New York Combined Sales Tax", hasExemptions: false },
      NC: { rate: 0.0700, name: "North Carolina Sales Tax", hasExemptions: false },
      ND: { rate: 0.0696, name: "North Dakota Sales Tax", hasExemptions: false },
      OH: { rate: 0.0724, name: "Ohio Sales Tax", hasExemptions: false },
      OK: { rate: 0.0898, name: "Oklahoma Sales Tax", hasExemptions: false },
      OR: { rate: 0.0000, name: "Oregon Zero Sales Tax", hasExemptions: true },
      PA: { rate: 0.0634, name: "Pennsylvania Sales Tax", hasExemptions: false },
      RI: { rate: 0.0700, name: "Rhode Island Sales Tax", hasExemptions: false },
      SC: { rate: 0.0744, name: "South Carolina Sales Tax", hasExemptions: false },
      SD: { rate: 0.0640, name: "South Dakota Sales Tax", hasExemptions: false },
      TN: { rate: 0.0955, name: "Tennessee Sales Tax", hasExemptions: false },
      TX: { rate: 0.0820, name: "Texas Combined Sales Tax", hasExemptions: false },
      UT: { rate: 0.0719, name: "Utah Sales Tax", hasExemptions: false },
      VT: { rate: 0.0624, name: "Vermont Sales Tax", hasExemptions: false },
      VA: { rate: 0.0575, name: "Virginia Sales Tax", hasExemptions: false },
      WA: { rate: 0.0929, name: "Washington Combined Sales Tax", hasExemptions: false },
      WV: { rate: 0.0652, name: "West Virginia Sales Tax", hasExemptions: false },
      WI: { rate: 0.0543, name: "Wisconsin Sales Tax", hasExemptions: false },
      WY: { rate: 0.0536, name: "Wyoming Sales Tax", hasExemptions: false },
    },
  },

  // Canadian Provincial Harmonized / General / Provincial Sales Tax
  CA: {
    defaultRate: 0.13,
    name: "HST / GST",
    provinces: {
      ON: { rate: 0.1300, name: "Ontario Harmonized Sales Tax (HST)", breakdown: { hst: 0.13 } },
      BC: { rate: 0.1200, name: "British Columbia GST (5%) + PST (7%)", breakdown: { gst: 0.05, pst: 0.07 } },
      AB: { rate: 0.0500, name: "Alberta GST (5%)", breakdown: { gst: 0.05 } },
      QC: { rate: 0.14975, name: "Quebec GST (5%) + QST (9.975%)", breakdown: { gst: 0.05, qst: 0.09975 } },
      NS: { rate: 0.1500, name: "Nova Scotia Harmonized Sales Tax (HST)", breakdown: { hst: 0.15 } },
      NB: { rate: 0.1500, name: "New Brunswick Harmonized Sales Tax (HST)", breakdown: { hst: 0.15 } },
      MB: { rate: 0.1200, name: "Manitoba GST (5%) + RST (7%)", breakdown: { gst: 0.05, rst: 0.07 } },
      SK: { rate: 0.1100, name: "Saskatchewan GST (5%) + PST (6%)", breakdown: { gst: 0.05, pst: 0.06 } },
      NL: { rate: 0.1500, name: "Newfoundland & Labrador HST", breakdown: { hst: 0.15 } },
      PE: { rate: 0.1500, name: "Prince Edward Island HST", breakdown: { hst: 0.15 } },
      NT: { rate: 0.0500, name: "Northwest Territories GST", breakdown: { gst: 0.05 } },
      NU: { rate: 0.0500, name: "Nunavut GST", breakdown: { gst: 0.05 } },
      YT: { rate: 0.0500, name: "Yukon GST", breakdown: { gst: 0.05 } },
    },
  },

  // India Goods & Services Tax (GST)
  IN: {
    defaultRate: 0.05, // 5% for commodity/food agro products
    name: "Goods and Services Tax (GST)",
    breakdown: {
      standardRate: 0.05,
      cgst: 0.025,
      sgst: 0.025,
      igst: 0.05,
    },
  },
};

/**
 * Autonomous Local Tax Engine Calculator
 *
 * @param {object} params
 * @param {string} params.countryCode Country code (US, CA, IN)
 * @param {string} [params.stateCode] State or province code (e.g. CA, NY, ON, BC)
 * @param {string} [params.postalCode] ZIP / Postal Code
 * @param {number} params.subtotal Order subtotal
 * @param {Array} [params.items] Cart line items
 * @returns {object} Calculated tax data breakdown
 */
export function calculateCheckoutTax({
  countryCode = "US",
  stateCode = "",
  postalCode = "",
  subtotal = 0,
  items = [],
}) {
  const normCountry = (countryCode || "US").toUpperCase();
  const normState = (stateCode || "").toUpperCase().trim();
  const safeSubtotal = Number(subtotal) || 0;

  let effectiveRate = 0.05;
  let taxName = "Standard Tax";
  let jurisdiction = normState || normCountry;
  let breakdown = null;

  if (normCountry === "US") {
    const usData = TAX_DATASET.US;
    const stateConfig = usData.states[normState];

    if (stateConfig) {
      effectiveRate = stateConfig.rate;
      taxName = stateConfig.name;
      jurisdiction = `${normState}, US`;
    } else {
      effectiveRate = usData.defaultRate;
      taxName = usData.name;
      jurisdiction = "United States";
    }
  } else if (normCountry === "CA") {
    const caData = TAX_DATASET.CA;
    const provinceConfig = caData.provinces[normState];

    if (provinceConfig) {
      effectiveRate = provinceConfig.rate;
      taxName = provinceConfig.name;
      jurisdiction = `${normState}, Canada`;
      breakdown = provinceConfig.breakdown;
    } else {
      effectiveRate = caData.defaultRate;
      taxName = caData.name;
      jurisdiction = "Canada";
    }
  } else if (normCountry === "IN") {
    const inData = TAX_DATASET.IN;
    effectiveRate = inData.defaultRate;
    taxName = inData.name;
    jurisdiction = "India GST";
    breakdown = inData.breakdown;
  } else {
    effectiveRate = 0.05;
    taxName = "Standard VAT / Import Duty";
    jurisdiction = normCountry;
  }

  const totalTax = Number((safeSubtotal * effectiveRate).toFixed(2));

  return {
    subtotal: safeSubtotal,
    effectiveRate,
    ratePercentage: Number((effectiveRate * 100).toFixed(3)),
    totalTax,
    taxName,
    jurisdiction,
    breakdown,
    postalCode: postalCode || null,
    engine: "DATASET_LOCAL_ENGINE",
  };
}

export default {
  TAX_DATASET,
  calculateCheckoutTax,
};
