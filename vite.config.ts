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
      "63a19b32-161b-4bf1-a9f3-2e8cec03d246-00-2uo3w07japhc7.worf.replit.dev",
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
