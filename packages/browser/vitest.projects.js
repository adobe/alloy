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

const isCi = !!process.env.CI;
const fileParallelism = process.env.FILE_PARALLELISM !== "false";

const packageCoverage = {
  include: ["packages/browser/src/**/*"],
  reporter: isCi ? ["lcov"] : ["lcov", "html", "text"],
};

const createBrowserMode = () => ({
  provider: playwright(),
  instances: [
    {
      browser: "chromium",
    },
  ],
  enabled: true,
  headless: true,
  screenshotFailures: false,
  fileParallelism,
});

/**
 * @adobe/alloy (browser) Vitest project(s), spread into the root `vitest.config.js` `test.projects` array.
 * Each project must get its own `browser` options object; Vitest mutates it and reusing one
 * causes duplicate "… (chromium)" nested project names.
 */
export const browserTestProjects = [
  defineProject({
    extends: false,
    test: {
      name: "browser/unit",
      include: [
        "packages/browser/test/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      ],
      isolate: false,
      browser: createBrowserMode(),
      coverage: packageCoverage,
    },
  }),
  defineProject({
    extends: false,
    test: {
      name: "browser/integration",
      include: [
        "packages/browser/test/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)",
      ],
      isolate: false,
      browser: createBrowserMode(),
      coverage: packageCoverage,
    },
  }),
];
