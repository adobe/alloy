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
