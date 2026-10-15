import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.BROWSER_SANDBOX_PORT || 3000),
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
  html: {
    cspNonce: crypto.randomUUID(),
  },
  fs: {
    allow: [".."],
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rolldownOptions: {
      input: {
        main: path.resolve(dirname, "index.html"),
        alloyServiceWorker: path.resolve(dirname, "alloyServiceWorker.js"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "alloyServiceWorker"
            ? "alloyServiceWorker.js"
            : "assets/[name]-[hash].js",
      },
    },
  },
});
