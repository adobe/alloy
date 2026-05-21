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
      react({
        jsxRuntime: "automatic",
      }),
    ],
    test: {
      name: "reactor-extension/integration",
      include: [
        "packages/reactor-extension/test/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      ],
      testTimeout: 30_000,
      hookTimeout: 30_000,
      isolate: true,
      browser: {
        enabled: true,
        instances: [{ browser: "chromium" }],
        provider: playwright({
          actionTimeout: 5_000,
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
