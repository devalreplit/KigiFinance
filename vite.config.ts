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
      "cd65211f-dd0a-45ce-af0b-a2c72577b2d2-00-1gjonbeyp48yy.picard.replit.dev",
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
