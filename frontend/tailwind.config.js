/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#003D2B",     // Sidebar, header
          primary: "#006B3C",  // Primary buttons, links
          fresh: "#008C52",    // Active states, highlights
          light: "#EAF7F0",    // Cards, backgrounds
          50: "#F2FAF5",
          100: "#EAF7F0",
          200: "#C7EBDA",
          300: "#92D6B5",
          400: "#54BC8C",
          500: "#008C52",
          600: "#006B3C",
          700: "#00522E",
          800: "#003D2B",
          900: "#00291D",
          950: "#001A12",
        },
        gold: {
          premium: "#D9A514",  // B2B pricing, premium labels
          soft: "#FFF7DD",     // Premium card backgrounds
          50: "#FFFDF5",
          100: "#FFF7DD",
          200: "#FFEBB2",
          300: "#FFDC80",
          400: "#F0C240",
          500: "#D9A514",
          600: "#B8860B",
          700: "#946A05",
          800: "#735100",
          900: "#4D3600",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#EAF7F0",
          green: "#EAF7F0",
          card: "#FFFFFF",
          gold: "#FFF7DD",
        },
        text: {
          primary: "#0A1F16",
          secondary: "#345547",
          muted: "#5E7D6F",
        },
        border: {
          DEFAULT: "#D2E8DC",
        },
      },
    },
  },
  plugins: [],
};
