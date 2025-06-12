// eslint-disable-next-line import/no-unresolved
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "scripts-tests",
    include: ["scripts/specs/*.{test,spec}.?(c|m)[jt]s?(x)"],
    isolate: false,
    pool: "threads",
    environment: "happy-dom",
  },
});
