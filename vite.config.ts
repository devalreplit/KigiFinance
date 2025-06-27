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
      "abc93993-6e2a-46ae-a4f9-98e9514b7c1d-00-1ibjphisgekyx.spock.replit.dev",
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
