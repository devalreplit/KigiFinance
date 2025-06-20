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
      "0081100a-09cf-458e-9e1f-f05f60265343-00-287kqli3c5xkl.worf.replit.dev",
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
