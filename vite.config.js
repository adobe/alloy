// eslint-disable-next-line import/no-unresolved
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "unit-tests",
    include: ["vtest/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    isolate: false,
    pool: "threads",
    browser: {
      provider: "playwright",
      name: "chromium",
      enabled: true,
      headless: true,
    },
    coverage: {
      include: ["src/**/*"],
    },
  },
});
