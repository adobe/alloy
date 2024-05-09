/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const glob = require("glob");

const allComponentPaths = glob.sync("src/components/*/");

module.exports = {
  extends: ["airbnb-base", "prettier", "plugin:testcafe/recommended"],
  env: {
    browser: true,
    node: true,
    jasmine: true,
  },
  plugins: ["ban", "prettier", "testcafe"],
  rules: {
    "ban/ban": [
      "error",
      { name: ["describe", "only"], message: "don't focus tests" },
      { name: "fdescribe", message: "don't focus tests" },
      { name: ["it", "only"], message: "don't focus tests" },
      { name: "fit", message: "don't focus tests" },
      { name: ["fixture", "only"], message: "don't focus tests" },
      { name: ["test", "only"], message: "don't focus tests" },
      { name: "ftest", message: "don't focus tests" },
    ],
    "prettier/prettier": "error",
    "no-param-reassign": ["error", { props: false }],
    "func-style": "error",
    // Turning this off allows us to import devDependencies in our build tools.
    // We enable the rule in src/.eslintrc.js since that's the only place we
    // want to disallow importing extraneous dependencies.
    "import/no-extraneous-dependencies": "off",
    "prefer-destructuring": "off",
    "import/prefer-default-export": "off",
    // Make rules about importing between the top level folders
    // core can import from utils, and constants
    // components can import from utils, and constants
    // utils can import from constants
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          // prevent components from importing from other components, but allow
          // importing from themselves
          ...allComponentPaths.map((path, index, allPaths) => ({
            target: path,
            from: [
              "src/core",
              "src/baseCode",
              ...allPaths.filter((p) => p !== path),
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
  globals: {
    expectAsync: "readonly", // newer jasmine feature
    spyOnAllFunctions: "readonly", // newer jasmine feature
  },
};
