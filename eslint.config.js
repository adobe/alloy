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
import pluginJs from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import vitest from "@vitest/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import compatPlugin from "eslint-plugin-compat";
// eslint-disable-next-line import/no-unresolved
import { defineConfig, globalIgnores } from "eslint/config";
import { glob } from "glob";
import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";

const allComponentPaths = glob.sync("src/components/*/");
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
});

/**
 * @typedef {import("eslint").Linter} ESLintLinter
 * @type {Partial<ESLintLinter.Config<ESLintLinter.RulesRecord>>}
 */
const airbnbBase = {
  "no-plusplus": "error",
  "prefer-const": [
    "error",
    {
      destructuring: "any",
      ignoreReadBeforeAssign: true,
    },
  ],
  "no-continue": "error",
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
      selector: "ForOfStatement",
      message:
        "iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.",
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
  "import/no-extraneous-dependencies": [
    "error",
    {
      devDependencies: [
        "test/**", // tape, common npm pattern
        "tests/**", // also common npm pattern
        "spec/**", // mocha, rspec-like pattern
        "**/__tests__/**", // jest pattern
        "**/__mocks__/**", // jest pattern
        "test.{js,jsx}", // repos with a single test file
        "test-*.{js,jsx}", // repos with multiple top-level test files
        "**/*{.,_}{test,spec}.{js,jsx}", // tests where the extension or filename suffix denotes that it is a test
        "**/jest.config.js", // jest config
        "**/jest.setup.js", // jest setup
        "**/vue.config.js", // vue-cli config
        "**/webpack.config.js", // webpack config
        "**/webpack.config.*.js", // webpack config
        "**/rollup.config.js", // rollup config
        "**/rollup.config.*.js", // rollup config
        "**/gulpfile.js", // gulp config
        "**/gulpfile.*.js", // gulp config
        "**/Gruntfile{,.js}", // grunt config
        "**/protractor.conf.js", // protractor config
        "**/protractor.conf.*.js", // protractor config
        "**/karma.conf.js", // karma config
        "**/.eslintrc.js", // eslint config
      ],
      optionalDependencies: false,
    },
  ],
  "no-unused-vars": ["error", { ignoreRestSiblings: true }],
};

export default defineConfig([
  ...compat.extends("plugin:testcafe/recommended"),
  ...compat.plugins("testcafe"),
  importPlugin.flatConfigs.recommended,
  globalIgnores(["sandbox/build/", "sandbox/public/", "node_modules/"]),
  {
    files: ["**/*.{js,cjs,mjs,jsx}"],
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".cjs", ".mjs", ".jsx"],
        },
      },
    },
    languageOptions: {
      parserOptions: {
        babelOptions: {
          presets: ["@babel/preset-env"],
        },
      },
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...airbnbBase,
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
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
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

  {
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
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      react,
    },
    rules: {
      ...react.configs.recommended.rules,
    },
  },

  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  compatPlugin.configs["flat/recommended"],
  // Vite plugins are ESM-only and confuse eslint-plugin-import; disable the
  // affected `import/*` rules for the Vite config file only.
  {
    files: ["sandbox/vite.config.mjs"],
    rules: {
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
    },
  },
]);
