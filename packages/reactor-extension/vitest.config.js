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

/* eslint-disable import/no-unresolved */
import { defineProject } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";

export default defineProject({
  test: {
    projects: [
      {
        extends: false,
        test: {
          name: "unit",
          include: ["test/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          isolate: false,
          environment: "happy-dom",
        },
      },
      {
        extends: false,

        plugins: [
          react({
            jsxRuntime: "automatic",
          }),
        ],

        test: {
          name: "integration",
          include: ["test/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          isolate: true,
          browser: {
            enabled: true,
            instances: [
              {
                browser: "chromium",
              },
            ],
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            locators: {
              testIdAttribute: "data-test-id",
            },
            viewport: {
              width: 1000,
              height: 1000,
            },
          },
          setupFiles: ["test/integration/helpers/setup.js"],
        },
      },
    ],
    coverage: {
      include: ["src/**/*.{js,jsx}"],
      reporter: ["lcov", "html", "text"],
    },
  },
});
