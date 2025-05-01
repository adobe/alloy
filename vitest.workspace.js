// eslint-disable-next-line import/no-unresolved
import { defineWorkspace } from "vitest/config";

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  {
    extends: "./vitest.config.js",
    test: {
      name: "unit",
      include: ["test/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    },
  },
  {
    extends: "./vitest.config.js",
    test: {
      name: "integration",
      include: ["test/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    },
  },
]);
