// eslint-disable-next-line import/no-unresolved
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "unit-tests",
    include: ["test/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    isolate: false,
    browser: {
      provider: "playwright",
      instances: [
        {
          browser: "chromium",
        },
      ],
      enabled: true,
      headless: true,
    },
    coverage: {
      include: ["src/**/*"],
    },
  },
});
