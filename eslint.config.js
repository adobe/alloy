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

import pluginJs from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import compatPlugin from "eslint-plugin-compat";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
// eslint-disable-next-line import/no-unresolved -- eslint parses this a file, but it's a depenedency
import { defineConfig, globalIgnores } from "eslint/config";
import { glob } from "glob";
import globals from "globals";

const allComponentPaths = glob.sync("src/components/*/");

export default defineConfig([
  importPlugin.flatConfigs.recommended,
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  compatPlugin.configs["flat/recommended"],
  globalIgnores(["sandbox/build/", "sandbox/public/", "node_modules/"]),
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
      "no-console": "error",
      "no-underscore-dangle": "error",
      "func-names": "error",
      "import/no-relative-packages": "error",
      "no-bitwise": "error",
      "default-param-last": "error",
      eqeqeq: ["error", "smart"],
      "dot-notation": "error",
      "no-await-in-loop": "error",
      "default-case": "error",
      "prefer-object-spread": "error", // disallow certain syntax forms
      // https://eslint.org/docs/rules/no-restricted-syntax
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
      "func-style": "error",
      // Turning this off allows us to import devDependencies in our build tools.
      // We enable the rule in src/.eslintrc.js since that's the only place we
      // want to disallow importing extraneous dependencies.
      "import/prefer-default-export": "off",
    },
  },
  {
    name: "alloy/src",
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
  {
    name: "alloy/scripts",
    files: ["scripts/**/*.{cjs,js}"],
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
    name: "alloy/tests/vitest",
    files: [
      "test/{unit,integration}/**/*.{cjs,js}",
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
    files: ["test/functional/**/*.{cjs,js}"],
    languageOptions: {
      globals: {
        test: "readonly",
        fixture: "readonly",
        ...globals.node,
      },
    },
  },
  {
    name: "alloy/sandbox",
    files: ["sandbox/src/**/*.{js,jsx}"],
    settings: {
      react: {
        version: "17.0.2",
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
    },
    rules: {
      ...react.configs.recommended.rules,
    },
  },
  // Vite plugins are ESM-only and confuse eslint-plugin-import; disable the
  // affected `import/*` rules for the Vite config file only.
  {
    name: "alloy/configs",
    files: [
      "sandbox/vite.config.mjs",
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
]);
