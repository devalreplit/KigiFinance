import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: [
      "d6f78b63-0140-43d6-bd81-f817565b20b0-00-2623re3ti7sle.picard.replit.dev",
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
