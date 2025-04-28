/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  },
});
