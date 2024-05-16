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

import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import pluginJs from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { glob } from "glob";

const allComponentPaths = glob.sync("src/components/*/");
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
});

export default [
  ...compat.extends("airbnb-base", "plugin:testcafe/recommended"),
  ...compat.plugins("ban", "testcafe"),
  {
    files: ["**/*.{js,cjs}"],
    settings: {
      // This will do the trick
      "import/parsers": {
        "@babel/eslint-parser": [".js", ".cjs", ".mjs"],
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".cjs", ".mjs"],
        },
      },
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        babelOptions: {
          presets: ["@babel/preset-env"],
        },
      },
      ecmaVersion: 2021,
      globals: {
        ...globals.jasmine,
        ...globals.browser,
        ...globals.node,
        fixture: true,
        test: true,
        expectAsync: "readonly", // newer jasmine feature
        spyOnAllFunctions: "readonly", // newer jasmine feature
      },
    },
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
      "no-param-reassign": "off",
      "prettier/prettier": "error",
      "func-style": "error",
      // Turning this off allows us to import devDependencies in our build tools.
      // We enable the rule in src/.eslintrc.js since that's the only place we
      // want to disallow importing extraneous dependencies.
      "import/no-extraneous-dependencies": "off",
      "prefer-destructuring": "off",
      "import/prefer-default-export": "off",
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
  {
    files: ["src/**/*.{cjs,js}"],
    languageOptions: {
      globals: {
        turbine: "readonly",
      },
    },
    rules: {
      "import/no-extraneous-dependencies": "error",
      "import/extensions": [
        "error",
        {
          js: "always",
        },
      ],
    },
  },
  {
    files: ["test/**/*.{cjs,js}"],
    rules: {
      "import/extensions": [
        "error",
        {
          js: "always",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.{cjs,js}"],
    rules: {
      "no-console": "off",
      "import/extensions": [
        "error",
        {
          js: "always",
        },
      ],
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
];
