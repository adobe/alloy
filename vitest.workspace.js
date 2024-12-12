// eslint-disable-next-line import/no-unresolved
import { defineWorkspace } from "vitest/config";

const filesForBrowser = [
  "vtest/unit/specs/components/Personalization/dom-actions/dom/selectNodesWithEq.spec.js",
  "vtest/unit/specs/components/Personalization/dom-actions/dom/matchesSelectorWithEq.spec.js",
  "vtest/unit/specs/components/Personalization/dom-actions/clicks/collectClicks.spec.js",
];

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  {
    // add "extends" to merge two configs together
    extends: "./vite.config.js",
    test: {
      exclude: filesForBrowser,
    },
  },
  {
    test: {
      name: "browser",
      include: filesForBrowser,
      isolate: false,
      pool: "threads",
      browser: {
        name: "chromium",
        enabled: true,
        headless: true,
        provider: "playwright",
      },
    },
  },
]);
