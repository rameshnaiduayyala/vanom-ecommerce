import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@tiptap") || id.includes("prosemirror")) {
              return "editor-vendor";
            }
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor")) {
              return "charts-vendor";
            }
            if (id.includes("@stripe")) {
              return "stripe-vendor";
            }
            if (id.includes("swiper")) {
              return "swiper-vendor";
            }
            if (id.includes("framer-motion") || id.includes("motion-dom")) {
              return "motion-vendor";
            }
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,

    allowedHosts: [
      "app.raphaedgeai.com",
    ],
  },
});
