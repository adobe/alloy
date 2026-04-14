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

import pluginJs from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import compatPlugin from "eslint-plugin-compat";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unusedImports from "eslint-plugin-unused-imports";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig, globalIgnores } from "eslint/config";
import { glob } from "glob";
import globals from "globals";
// eslint-disable-next-line import/extensions
import license from "./scripts/eslint/licenseRule.js";

const allComponentPaths = glob.sync("packages/core/src/components/*/");

const sharedIgnores = [
  "sandboxes/**",
  "dist/**",
  "distTest/**",
  "packages/**/dist/**",
  "packages/**/distTest/**",
  "launch*.js",
  "**/*.min.js",
  "**/at.js",
  "**/*AppMeasurement*",
];

export default defineConfig([
  importPlugin.flatConfigs.recommended,
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  globalIgnores([
    "sandboxes/**",
    "node_modules/",
    "launch*.js",
    "packages/reactor-extension/dist/**",
    "packages/reactor-extension/src/lib/runAlloy.js",
    "packages/core/test/**",
    "packages/browser/test/**",
    "**/scripts/**/*.mjs",
  ]),
  // License: warn only; do not run on extension so --fix never adds header there
  {
    name: "alloy/license-header",
    files: ["**/*.{cjs,js,mjs,jsx}"],
    ignores: [...sharedIgnores, "packages/reactor-extension/**"],
    plugins: {
      local: {
        rules: {
          license,
        },
      },
    },
    rules: {
      "local/license": "warn",
    },
  },
  // Base shared: rules that work for both core and extension
  {
    name: "alloy/shared",
    languageOptions: {
      ecmaVersion: "latest",
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".cjs", ".mjs", ".jsx"],
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "prefer-const": [
        "error",
        {
          destructuring: "any",
          ignoreReadBeforeAssign: true,
        },
      ],
      "valid-typeof": ["error", { requireStringLiterals: true }],
      "no-console": ["warn", { allow: ["error"] }],
      "no-underscore-dangle": [
        "error",
        {
          allow: [
            "_experience",
            "__dirname",
            "__filename",
            "__alloyMonitors",
            "__alloyNS",
          ],
        },
      ],
      "no-bitwise": "error",
      "default-param-last": "error",
      eqeqeq: ["error", "smart"],
      "dot-notation": "error",
      "no-await-in-loop": "error",
      "default-case": "error",
      "prefer-object-spread": "error",
      "import/no-unresolved": [
        "error",
        {
          ignore: [
            "eslint/config",
            "@adobe/alloy-core",
            "@adobe/alloy",
            "@adobe/alloy/*",
            "@adobe/auth-token",
            "uuid",
          ],
        },
      ],
      "max-classes-per-file": "error",
      "class-methods-use-this": "error",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          mjs: "never",
          jsx: "never",
        },
      ],
      "import/namespace": "off",
      "import/named": "error",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "no-unused-vars": ["error", { ignoreRestSiblings: true }],
      "prettier/prettier": "error",
      "import/prefer-default-export": "off",
    },
  },
  // Core/root only: stricter rules that extension does not use
  {
    name: "alloy/strict",
    files: ["**/*.{cjs,js,mjs,jsx}"],
    ignores: ["packages/reactor-extension/**", ...sharedIgnores],
    rules: {
      "func-names": "error",
      "func-style": "error",
      "import/no-relative-packages": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ForInStatement",
          message:
            "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
        },
        {
          selector: "LabeledStatement",
          message:
            "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
        },
        {
          selector: "WithStatement",
          message:
            "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
        },
      ],
    },
  },
  {
    name: "alloy/core-src",
    files: ["packages/*/src/**/*.{cjs,js}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["vitest.config.js"],
        },
      ],
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
            ...allComponentPaths.map((componentPath, _, allPaths) => ({
              target: componentPath + "/",
              from: [
                "packages/core/src/core",
                "packages/core/src/baseCode",
                ...allPaths
                  .filter((p) => {
                    if (
                      componentPath.includes("MediaAnalyticsBridge") &&
                      p.includes("StreamingMedia")
                    )
                      return false;
                    if (
                      componentPath.includes("StreamingMedia") &&
                      p.includes("MediaAnalyticsBridge")
                    )
                      return false;
                    if (
                      (componentPath.includes("MediaAnalyticsBridge") ||
                        componentPath.includes("StreamingMedia")) &&
                      p.includes("Context")
                    )
                      return false;
                    return p !== componentPath;
                  })
                  .map((p) => p + "/"),
              ],
            })),
            {
              target: "packages/core/src/core",
              from: "packages/core/src/baseCode",
            },
            {
              target: "packages/core/src/utils",
              from: [
                "packages/core/src/core",
                "packages/core/src/components",
                "packages/core/src/baseCode",
              ],
            },
            {
              target: "packages/core/src/constants",
              from: [
                "packages/core/src/core",
                "packages/core/src/components",
                "packages/core/src/utils",
                "packages/core/src/baseCode",
              ],
            },
          ],
        },
      ],
    },
  },

  {
    name: "alloy/browser",
    files: [
      "packages/browser/**/*.{cjs,js,mjs,jsx}",
      "sandboxes/browser/**/*.{cjs,js,mjs,jsx}",
      "packages/core/**/*.{cjs,js,mjs,jsx}", // TODO: Remove this once browser APIs are removed from core.
    ],
    plugins: {
      compat: compatPlugin,
    },
    rules: {
      ...compatPlugin.configs["flat/recommended"].rules,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    name: "alloy/browser-src",
    files: ["packages/browser/src/**/*.{cjs,js,mjs,jsx}"],
    rules: {
      "import/named": "off",
    },
  },
  {
    name: "alloy/scripts",
    files: [
      "scripts/**/*.{cjs,js,mjs}",
      "packages/*/scripts/**/*.{cjs,js,mjs}",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
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
  {
    name: "alloy/tests",
    files: ["packages/reactor-extension/test/**/*.{cjs,js,jsx}"],
    rules: {
      "import/extensions": [
        "error",
        {
          js: "always",
        },
      ],
      "no-unused-vars": "warn",
    },
  },
  {
    name: "alloy/tests/vitest",
    files: [
      "packages/**/test/{unit,integration}/**/*.{cjs,js,mjs,jsx}",
      "scripts/specs/**/*.{cjs,js}",
    ],
    settings: {
      "import/core-modules": ["vitest"],
    },
    plugins: {
      vitest,
    },
    extends: [vitest.configs.recommended],
  },
  {
    name: "alloy/tests/functional",
    files: ["packages/**/test/functional/**/*.{cjs,js,mjs,jsx}"],
    settings: {
      "import/core-modules": ["@adobe/alloy", "testcafe", "uuid"],
    },
    languageOptions: {
      globals: {
        test: "readonly",
        fixture: "readonly",
        ...globals.node,
      },
    },
  },
  {
    name: "alloy/browser-sandbox",
    files: ["sandboxes/browser/src/**/*.{js,jsx}"],
    settings: {
      react: {
        version: "19.0.0",
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
      compat: compatPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      "react/prop-types": "off",
      ...compatPlugin.configs["flat/recommended"].rules,
    },
  },
  {
    name: "alloy/configs",
    files: [
      "sandboxes/**/vite.config.mjs",
      "packages/**/rollup.config.js",
      "packages/**/vitest.config.js",
      "rollup.config.js",
      "eslint.config.js",
      "vitest.config.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-extraneous-dependencies": "error",
    },
  },

  // --- Extension-only: packages/reactor-extension (repo-relative paths) ---
  {
    name: "alloy/reactor-extension",
    files: ["packages/reactor-extension/**/*.{cjs,js,mjs,jsx}"],
    settings: {
      react: {
        version: "19.0.0",
      },
    },
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      vitest,
      react,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      "no-underscore-dangle": [
        "error",
        {
          allow: [
            "_experience",
            "__dirname",
            "__filename",
            "__alloyMonitors",
            "__alloyNS",
            "__adobe",
          ],
        },
      ],
      "import/extensions": "off",
      "import/default": "off",
      "import/namespace": "off",
      "func-names": "off",
      "no-restricted-syntax": "off",
      "no-param-reassign": "off",
      "prefer-destructuring": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "import/no-extraneous-dependencies": "off",
      "vitest/expect-expect": "error",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
      "vitest/no-identical-title": "error",
      "react/require-default-props": "off",
      "react/no-array-index-key": "off",
      "react/forbid-prop-types": "off",
      "react/jsx-props-no-spreading": "off",
      "react/function-component-definition": [
        "error",
        { namedComponents: "arrow-function" },
      ],
      "jsx-a11y/label-has-associated-control": [
        "error",
        { controlComponents: ["WrappedField"] },
      ],
      "jsx-a11y/label-has-for": "off",
      "jsx-a11y/anchor-is-valid": ["error", { components: [] }],
    },
  },
  {
    name: "alloy/reactor-extension/src",
    files: ["packages/reactor-extension/src/**/*.{cjs,js,jsx}"],
    languageOptions: {
      globals: {
        _satellite: "readonly",
      },
    },
    rules: {
      "import/no-extraneous-dependencies": "error",
    },
  },
  {
    name: "alloy/reactor-extension/view-and-tests",
    files: [
      "packages/reactor-extension/src/view/**/*.{js,jsx}",
      "packages/reactor-extension/test/functional/**/*.{js,jsx}",
      "packages/reactor-extension/test/integration/**/*.{js,jsx}",
    ],
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
    },
  },
  {
    name: "alloy/reactor-extension/src-lib",
    files: ["packages/reactor-extension/src/lib/**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        turbine: "readonly",
      },
    },
    rules: {
      "no-var": "off",
      "func-names": "off",
      "no-underscore-dangle": [
        "error",
        { allow: ["__alloyNS", "__alloyMonitors", "__adobe"] },
      ],
    },
  },
  {
    name: "alloy/reactor-extension/integration-testing-library",
    files: ["packages/reactor-extension/test/integration/**/*.{js,jsx}"],
    ...testingLibrary.configs["flat/react"],
    rules: {
      ...testingLibrary.configs["flat/react"].rules,
      "testing-library/prefer-screen-queries": "off",
    },
  },
  // Extension functional tests use testcafe/browser patterns; relax vitest assertion rules
  {
    name: "alloy/reactor-extension/functional-tests",
    files: ["packages/reactor-extension/test/functional/**/*.{cjs,js,mjs,jsx}"],
    rules: {
      "vitest/expect-expect": "off",
      "vitest/no-identical-title": "off",
      "unused-imports/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^(_|t)$" },
      ],
    },
  },
  // Extension unit tests: relax title rule for dynamic titles
  {
    name: "alloy/reactor-extension/unit-tests",
    files: ["packages/reactor-extension/test/unit/**/*.{cjs,js,jsx}"],
    rules: {
      "vitest/valid-title": "warn",
    },
  },
]);
