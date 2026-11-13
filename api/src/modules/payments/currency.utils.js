/**
 * currency.utils.js — High-precision currency decimal and smallest-unit conversions.
 *
 * Stripe requires amounts to be passed in the smallest currency unit:
 * - Zero-decimal currencies (JPY, KRW, etc.): amount is an integer (e.g., ¥100 = 100).
 * - Three-decimal currencies (BHD, KWD, etc.): amount is multiplied by 1000 (e.g., 1.500 = 1500).
 * - Standard currencies (USD, CAD, EUR, GBP, INR, etc.): amount is multiplied by 100 (e.g., $10.50 = 1050).
 */

// ISO 4217 zero-decimal currencies supported by Stripe
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", // Burundian Franc
  "CLP", // Chilean Peso
  "DJF", // Djiboutian Franc
  "GNF", // Guinean Franc
  "JPY", // Japanese Yen
  "KMF", // Comorian Franc
  "KRW", // South Korean Won
  "MGA", // Malagasy Ariary
  "PYG", // Paraguayan Guaraní
  "RWF", // Rwandan Franc
  "UGX", // Ugandan Shilling
  "VND", // Vietnamese Đồng
  "VUV", // Vanuatu Vatu
  "XAF", // Central African CFA Franc
  "XOF", // West African CFA Franc
  "XPF", // CFP Franc
]);

// Three-decimal currencies
const THREE_DECIMAL_CURRENCIES = new Set([
  "BHD", // Bahraini Dinar
  "JOD", // Jordanian Dinar
  "KWD", // Kuwaiti Dinar
  "OMR", // Omani Rial
  "TND", // Tunisian Dinar
]);

/**
 * Returns the number of decimal places for a given currency code.
 *
 * @param {string} currencyCode
 * @returns {number}
 */
export function getCurrencyDecimalPlaces(currencyCode) {
  if (!currencyCode || typeof currencyCode !== "string") return 2;
  const upper = currencyCode.trim().toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(upper)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(upper)) return 3;
  return 2;
}

/**
 * Returns the multiplier to convert 1 standard unit to Stripe smallest units.
 *
 * @param {string} currencyCode
 * @returns {number}
 */
export function getCurrencyMultiplier(currencyCode) {
  const decimals = getCurrencyDecimalPlaces(currencyCode);
  return Math.pow(10, decimals);
}

/**
 * Converts a decimal application amount (e.g. 29.99 USD or 2500 JPY) to Stripe integer smallest unit.
 *
 * @param {number|string} amount
 * @param {string} currencyCode
 * @returns {number} Integer amount in smallest unit
 */
export function toStripeAmount(amount, currencyCode) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`Invalid payment amount: ${amount}`);
  }
  const multiplier = getCurrencyMultiplier(currencyCode);
  return Math.round(num * multiplier);
}

/**
 * Converts a Stripe integer smallest unit back to application decimal format.
 *
 * @param {number} stripeAmount Integer in smallest unit
 * @param {string} currencyCode
 * @returns {number}
 */
export function fromStripeAmount(stripeAmount, currencyCode) {
  const num = Number(stripeAmount);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid Stripe amount: ${stripeAmount}`);
  }
  const multiplier = getCurrencyMultiplier(currencyCode);
  return Number((num / multiplier).toFixed(getCurrencyDecimalPlaces(currencyCode)));
}

/**
 * Validates whether two currency codes match case-insensitively.
 *
 * @param {string} appCurrency
 * @param {string} stripeCurrency
 * @returns {boolean}
 */
export function isCurrencyMatching(appCurrency, stripeCurrency) {
  if (!appCurrency || !stripeCurrency) return false;
  return String(appCurrency).trim().toLowerCase() === String(stripeCurrency).trim().toLowerCase();
}

/**
 * Validates whether the application order amount equals the Stripe smallest-unit amount.
 *
 * @param {number|string} appAmount
 * @param {number} stripeSmallestUnit
 * @param {string} currencyCode
 * @returns {boolean}
 */
export function isAmountMatching(appAmount, stripeSmallestUnit, currencyCode) {
  const expectedSmallestUnit = toStripeAmount(appAmount, currencyCode);
  return Math.abs(expectedSmallestUnit - Number(stripeSmallestUnit)) === 0;
}
