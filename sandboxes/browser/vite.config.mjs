import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  html: {
    cspNonce: crypto.randomUUID(),
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Resolve workspace package to root directory for compatibility layers
      "@adobe/alloy": path.resolve(dirname, "../../"),
    },
  },
});
