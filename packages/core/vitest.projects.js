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
import { sourceConditionResolve } from "../../vitest.shared.js";
// eslint-disable-next-line import/no-unresolved
import { playwright } from "@vitest/browser-playwright";

const isCi = !!process.env.CI;
const fileParallelism = process.env.FILE_PARALLELISM !== "false";

const packageCoverage = {
  include: ["packages/core/src/**/*"],
  reporter: isCi ? ["lcov"] : ["lcov", "html", "text"],
};

/**
 * @adobe/alloy-core Vitest project(s), spread into the root `vitest.config.js` `test.projects` array.
 */
export const coreTestProjects = [
  defineProject({
    extends: false,
    ...sourceConditionResolve,
    test: {
      name: "core/unit",
      include: ["packages/core/test/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
      isolate: false,
      browser: {
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
      },
      coverage: packageCoverage,
    },
  }),
  defineProject({
    extends: false,
    test: {
      name: "core/package",
      include: ["packages/core/test/package/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
      environment: "node",
      // Packing rebuilds dist/, so wait until no other tests are reading it.
      sequence: { groupOrder: 1 },
    },
  }),
];
