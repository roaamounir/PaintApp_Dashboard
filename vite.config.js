import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "node-vibrant": path.resolve(__dirname, "node_modules/node-vibrant/lib/browser.js"),
    },
  },
  server: {
    proxy: {
      "/api-backend": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-backend/, ""),
      },
    },
  },
});
