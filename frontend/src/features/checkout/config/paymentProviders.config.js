/**
 * Stripe Enterprise Payment Methods Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * All payment processing is strictly managed by Stripe Payment Services.
 * Supported instruments include Credit/Debit cards, Digital Wallets, and BNPL.
 */

export const PAYMENT_PROVIDERS = [
  // ── Card ─────────────────────────────────────────────────
  {
    id: "CARD",
    label: "Credit / Debit Card",
    sub: "Visa · Mastercard · Amex · Discover · JCB",
    icon: "💳",
    countries: ["*"],
    recommended: true,
    group: "Card",
    provider: "STRIPE",
  },

  // ── Digital Wallets (Stripe Express Checkout) ────────────
  {
    id: "APPLE_PAY",
    label: "Apple Pay",
    sub: "Biometric Touch ID / Face ID via Stripe",
    icon: "🍎",
    countries: ["*"],
    group: "Wallet",
    provider: "STRIPE",
  },
  {
    id: "GOOGLE_PAY",
    label: "Google Pay",
    sub: "Fast, 1-click checkout with Google Wallet",
    icon: "🇬",
    countries: ["*"],
    group: "Wallet",
    provider: "STRIPE",
  },
  {
    id: "LINK",
    label: "Link by Stripe",
    sub: "Secure 1-click instant checkout",
    icon: "⚡",
    countries: ["*"],
    recommended: true,
    group: "Wallet",
    provider: "STRIPE",
  },

  // ── Buy Now Pay Later (Stripe BNPL) ──────────────────────
  {
    id: "KLARNA",
    label: "Klarna",
    sub: "Pay in 4 installments or 30 days via Stripe",
    icon: "🩷",
    countries: ["US", "CA"],
    group: "BNPL",
    provider: "STRIPE",
  },
  {
    id: "AFTERPAY",
    label: "Afterpay",
    sub: "4 interest-free installments via Stripe",
    icon: "🟩",
    countries: ["US", "CA"],
    group: "BNPL",
    provider: "STRIPE",
  },
];

export function getProvidersForCountry(countryCode) {
  return PAYMENT_PROVIDERS.filter(
    (p) => p.countries.includes("*") || p.countries.includes(countryCode)
  );
}

export function getBackendProvider(checkoutProviderId) {
  return "STRIPE";
}

export function isRedirectProvider(checkoutProviderId) {
  return false;
}

export function groupProviders(providers) {
  return providers.reduce((acc, p) => {
    const key = p.group || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
}
