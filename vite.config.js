// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "happy-dom",
    include: ["vtest/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    environment: "happy-dom",
    isolate: false,
    pool: "threads",
  },
});
