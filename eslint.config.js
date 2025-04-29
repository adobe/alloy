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

export default defineConfig([
  ...compat.extends("airbnb-base", "plugin:testcafe/recommended"),
  ...compat.plugins("testcafe"),
  globalIgnores(["sandbox/build/", "sandbox/public/"]),
  {
    files: ["**/*.{js,cjs,jsx}"],
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
    files: ["test/unit/specs/**/*.{cjs,js}"],
    plugins: {
      vitest,
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
]);
