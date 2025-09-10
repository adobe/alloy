/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { defineConfig } from "eslint/config";
import { glob } from "glob";

const allComponentPaths = glob.sync("src/components/*/");

export default defineConfig([
  {
    name: "alloy/core-src",
    files: ["src/**/*.{cjs,js}"],
    rules: {
      "import/no-extraneous-dependencies": "error",
      "import/extensions": [
        "error",
        {
          js: "always",
        },
      ],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // prevent components from importing from other components, but allow
            // importing from themselves
            ...allComponentPaths.map((componentPath, _, allPaths) => ({
              target: componentPath,
              from: [
                "src/core",
                "src/baseCode",
                ...allPaths.filter((p) => p !== componentPath),
              ],
            })),
            {
              target: "src/core",
              from: "src/baseCode",
            },
            {
              target: "src/utils",
              from: ["src/core", "src/components", "src/baseCode"],
            },
            {
              target: "src/constants",
              from: ["src/core", "src/components", "src/utils", "src/baseCode"],
            },
          ],
        },
      ],
    },
  },
]);
