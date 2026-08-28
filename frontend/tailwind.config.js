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
          50: "#F0F8F1",
          100: "#E0F1E2",
          200: "#C1E3C5",
          300: "#91CC98",
          400: "#5DBB68",
          500: "#008522",
          600: "#006B1B",
          700: "#005616",
          800: "#003D12",
          900: "#00290C",
        },
        gold: {
          50: "#FFFBEA",
          100: "#FFF3BF",
          200: "#FFE78A",
          300: "#FFD34D",
          400: "#F5B800",
          500: "#D9A000",
          600: "#C89000",
          700: "#9A6F00",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAF8",
          green: "#EEF7EF",
          gold: "#FFF8DC",
        },
        text: {
          primary: "#172117",
          secondary: "#596359",
          muted: "#7A847A",
        },
        border: {
          DEFAULT: "#E2E8E2",
        },
      },
    },
  },
  plugins: [],
};
