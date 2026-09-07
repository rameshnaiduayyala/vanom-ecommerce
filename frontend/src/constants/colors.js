/**
 * Vanom Brand Design Tokens & Colors
 *
 * 🟩 Vanom Deep Green : #003D2B (Sidebar, header, dark containers)
 * 🟩 Vanom Green      : #006B3C (Primary buttons, links, brand accents)
 * 🟩 Fresh Green      : #008C52 (Active states, badges, highlights)
 * 🟩 Light Green      : #EAF7F0 (Cards, backgrounds, subtle tints)
 * 🟨 Premium Gold     : #D9A514 (B2B pricing, premium badges, VIP labels)
 * 🟨 Soft Gold        : #FFF7DD (Premium card backgrounds, warm tints)
 */

export const BRAND_COLORS = {
  // Deep Green - Sidebar, header, high-contrast dark surfaces
  DEEP_GREEN: "#003D2B",

  // Vanom Green - Primary buttons, links, key brand actions
  VANOM_GREEN: "#006B3C",

  // Fresh Green - Active states, success badges, live indicators, highlights
  FRESH_GREEN: "#008C52",

  // Light Green - Cards, container backgrounds, subtle green tints
  LIGHT_GREEN: "#EAF7F0",

  // Premium Gold - B2B pricing, enterprise labels, VIP tags
  PREMIUM_GOLD: "#D9A514",

  // Soft Gold - Premium card backgrounds, warm pill badges
  SOFT_GOLD: "#FFF7DD",
};

export const COLOR_PALETTE = {
  brand: {
    deep: BRAND_COLORS.DEEP_GREEN,
    primary: BRAND_COLORS.VANOM_GREEN,
    fresh: BRAND_COLORS.FRESH_GREEN,
    light: BRAND_COLORS.LIGHT_GREEN,
  },
  gold: {
    premium: BRAND_COLORS.PREMIUM_GOLD,
    soft: BRAND_COLORS.SOFT_GOLD,
  },
  surface: {
    card: "#FFFFFF",
    bg: BRAND_COLORS.LIGHT_GREEN,
    header: BRAND_COLORS.DEEP_GREEN,
    sidebar: BRAND_COLORS.DEEP_GREEN,
    premiumBg: BRAND_COLORS.SOFT_GOLD,
  },
  text: {
    primary: "#0A1F16",
    secondary: "#345547",
    muted: "#5E7D6F",
    light: "#EAF7F0",
    gold: BRAND_COLORS.PREMIUM_GOLD,
  },
  border: {
    default: "#D2E8DC",
    focus: BRAND_COLORS.VANOM_GREEN,
    gold: BRAND_COLORS.PREMIUM_GOLD,
  },
};

export default BRAND_COLORS;
