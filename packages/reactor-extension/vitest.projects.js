/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
// eslint-disable-next-line import/no-unresolved
import { defineProject } from "vitest/config";
// eslint-disable-next-line import/no-unresolved
import { playwright } from "@vitest/browser-playwright";
// eslint-disable-next-line import/no-unresolved
import react from "@vitejs/plugin-react";
// eslint-disable-next-line import/no-unresolved
import macros from "unplugin-parcel-macros";
const isCi = !!process.env.CI;

const packageCoverage = {
  include: ["packages/reactor-extension/src/**/*.{js,jsx}"],
  reporter: isCi ? ["lcov"] : ["lcov", "html", "text"],
};

/**
 * Reactor extension Vitest projects, spread into the root `vitest.config.js` `test.projects`
 * array. Vitest only registers top-level projects for `--project` filters; a nested
 * config file or default-exported array is not enough.
 */
export const reactorExtensionTestProjects = [
  defineProject({
    extends: false,
    test: {
      name: "reactor-extension/unit",
      include: [
        "packages/reactor-extension/test/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      ],
      isolate: false,
      environment: "happy-dom",
      coverage: packageCoverage,
    },
  }),
  defineProject({
    extends: false,
    plugins: [
      // Must run before @vitejs/plugin-react so the S2 `style()` macro is
      // evaluated at build time (parity with Parcel's native macro support).
      macros.vite(),
      react({
        jsxRuntime: "automatic",
      }),
    ],
    // The S2 `style()` macro is imported from a build-time-only `./style`
    // subpath with no browser export. Keep Vite's dep pre-scanner from
    // resolving it as a runtime module; the macro plugin handles it instead.
    // `illustrations/linear/Error` must be pre-bundled up front too: left to
    // Vite's on-demand discovery under `isolate: true`, a test worker can pick
    // up a second, differently-bundled copy of react-aria-components mid-run,
    // which crashes with "Cannot read properties of null (reading
    // 'useContext')" the first time an isolated file renders it.
    optimizeDeps: {
      exclude: ["@react-spectrum/s2/style"],
      include: ["@react-spectrum/s2/illustrations/linear/Error"],
    },
    test: {
      name: "reactor-extension/integration",
      include: [
        "packages/reactor-extension/test/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      ],
      testTimeout: 30_000,
      // Retry CPU-contention stalls in the full CI test suite.
      retry: isCi ? 2 : 0,
      hookTimeout: 30_000,
      isolate: true,
      browser: {
        enabled: true,
        instances: [{ browser: "chromium" }],
        provider: playwright({
          actionTimeout: 5_000,
          // Emulate `prefers-reduced-motion: reduce` so Spectrum (react-aria)
          // overlays skip their JS animation wait when opening/closing. Under the
          // coverage job's CPU contention that wait stalls for seconds and flakes
          // overlay-driven tests (e.g. configOverrideSection). This complements
          // setup.js's CSS animation-duration override, which keeps elements
          // click-actionable (S2's CSS animations are not gated on reduced-motion).
          contextOptions: { reducedMotion: "reduce" },
        }),
        headless: true,
        screenshotFailures: false,
        locators: { testIdAttribute: "data-test-id" },
        viewport: { width: 1000, height: 1000 },
      },
      setupFiles: [
        "packages/reactor-extension/test/integration/helpers/setup.js",
      ],
      coverage: packageCoverage,
    },
  }),
];
