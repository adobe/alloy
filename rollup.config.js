/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import path from "path";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";

// Boolean Environment Options:
// Should the output files be minified?
const minify = process.env.MINIFY;
// If true, output files to sandbox, if false output files to dist/
const sandbox = process.env.SANDBOX;
// Build the base code file?
const baseCode = process.env.BASE_CODE;
// Build the npm library local rollup file? (This is used to test the npm version in functional tests)
const npmLibraryLocal = process.env.NPM_LIBRARY_LOCAL;
// Build the npm library rollup based on the production npm library?
const npmLibraryProd = process.env.NPM_LIBRARY_PROD;

const destDirectory = sandbox ? "sandbox/public" : "dist/";

const minifiedExtension = minify ? ".min" : "";

const BASE_CODE = "baseCode";
const STANDALONE = "standalone";
const NPM_LIBRARY_LOCAL = "npmLibraryLocal";
const NPM_LIBRARY_PROD = "npmLibraryProd";

const buildPlugins = version => {
  const plugins = [
    resolve({
      preferBuiltins: false,
      // Support the browser field in dependencies' package.json.
      // Useful for the uuid package.
      mainFields: ["module", "main", "browser"]
    }),
    commonjs(),
    babel({ envName: "rollup" })
  ];

  if (minify && version === BASE_CODE) {
    plugins.push(
      terser({
        mangle: true,
        compress: {
          unused: true
        },
        output: {
          wrap_func_args: false
        },
        toplevel: true
      })
    );
  }
  if (minify && version !== BASE_CODE) {
    plugins.push(terser());
  }

  if (!sandbox && version === STANDALONE) {
    plugins.push(
      license({
        banner: {
          content: {
            file: path.join(__dirname, "LICENSE_BANNER")
          }
        }
      })
    );
  }

  return plugins;
};

const config = [];

if (baseCode) {
  config.push({
    input: "src/baseCode.js",
    output: [
      {
        file: `${destDirectory}baseCode${minifiedExtension}.js`,
        format: "cjs",
        strict: false
      }
    ],
    plugins: buildPlugins(BASE_CODE)
  });
}

config.push({
  input: "src/standalone.js",
  output: [
    {
      file: `${destDirectory}alloy${minifiedExtension}.js`,
      format: "iife",
      intro:
        "if (document.documentMode && document.documentMode < 11) {\n" +
        "  console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');\n" +
        "  return;\n" +
        "}\n"
    }
  ],
  plugins: buildPlugins(STANDALONE)
});

if (npmLibraryLocal) {
  config.push({
    input: "test/functional/helpers/npmLibraryLocal.js",
    output: [
      {
        file: `${destDirectory}npmLibraryLocal${minifiedExtension}.js`,
        format: "iife"
      }
    ],
    plugins: buildPlugins(NPM_LIBRARY_LOCAL)
  });
}

if (npmLibraryProd) {
  config.push({
    input: "test/functional/helpers/npmLibraryProd.js",
    output: [
      {
        file: `${destDirectory}npmLibraryProd${minifiedExtension}.js`,
        format: "iife"
      }
    ],
    plugins: buildPlugins(NPM_LIBRARY_PROD)
  });
}

export default config;
