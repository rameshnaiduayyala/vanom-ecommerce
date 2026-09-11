/**
 * Payment Providers Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * To add a new provider: add one object to PAYMENT_PROVIDERS.
 * The checkout UI, filtering, and display are all data-driven from this file.
 *
 * Fields:
 *   id          — unique key sent to backend
 *   label       — display name
 *   sub         — subtitle / supported instruments
 *   icon        — emoji icon (replace with SVG import for production)
 *   countries   — ["US", "CA", "*"] — "*" means available everywhere
 *   recommended — show "Recommended" badge
 *   disabled    — grays out but keeps it visible (e.g. "Coming Soon")
 *   comingSoon  — shows "Coming Soon" overlay
 *   group       — optional UI group header ("Card", "Wallet", "BNPL", etc.)
 */

export const PAYMENT_PROVIDERS = [
  // ── Card ─────────────────────────────────────────────────────────
  {
    id:          "CARD",
    label:       "Credit / Debit Card",
    sub:         "Visa · Mastercard · Amex · Discover",
    icon:        "💳",
    countries:   ["*"],
    recommended: true,
    group:       "Card",
  },

  // ── Digital Wallets ───────────────────────────────────────────────
  {
    id:        "PAYPAL",
    label:     "PayPal",
    sub:       "Fast, secure PayPal checkout",
    icon:      "🅿️",
    countries: ["US", "CA"],
    group:     "Wallet",
  },
  {
    id:        "APPLE_PAY",
    label:     "Apple Pay",
    sub:       "Touch ID / Face ID",
    icon:      "🍎",
    countries: ["US", "CA"],
    group:     "Wallet",
  },
  {
    id:        "GOOGLE_PAY",
    label:     "Google Pay",
    sub:       "Pay with your Google account",
    icon:      "🇬",
    countries: ["US", "CA"],
    group:     "Wallet",
  },

  // ── Buy Now Pay Later ─────────────────────────────────────────────
  {
    id:          "AFTERPAY",
    label:       "Afterpay",
    sub:         "4 interest-free installments",
    icon:        "🟩",
    countries:   ["US", "CA"],
    group:       "BNPL",
    comingSoon:  false,
  },
  {
    id:          "KLARNA",
    label:       "Klarna",
    sub:         "Pay in 3 or pay later",
    icon:        "🩷",
    countries:   ["US"],
    group:       "BNPL",
    comingSoon:  true,
    disabled:    true,
  },
];

/**
 * Returns providers available for a given ISO country code.
 * @param {string} countryCode  e.g. "US" | "CA"
 * @returns {typeof PAYMENT_PROVIDERS}
 */
export function getProvidersForCountry(countryCode) {
  return PAYMENT_PROVIDERS.filter(
    (p) => p.countries.includes("*") || p.countries.includes(countryCode)
  );
}

/**
 * Groups providers by their `group` field for sectioned UI rendering.
 * @param {typeof PAYMENT_PROVIDERS} providers
 * @returns {Record<string, typeof PAYMENT_PROVIDERS>}
 */
export function groupProviders(providers) {
  return providers.reduce((acc, p) => {
    const key = p.group || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
}
