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
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import license from "rollup-plugin-license";

// Set these boolean environment options to control which files are built:
// build the snippet that must be add to the page
const BASE_CODE = "BASE_CODE";
// build the standalone distribution
const STANDALONE = "STANDALONE";
// build the standalone distribution, but put it in the sandbox directory
const SANDBOX = "SANDBOX";
// build the npm package entrypoint (createInstance)
const NPM_PACKAGE_LOCAL = "NPM_PACKAGE_LOCAL";
// build from the published npm package
const NPM_PACKAGE_PROD = "NPM_PACKAGE_PROD";
// Add "_MIN" to the end of the option name to build the minified version

const dirname = import.meta.dirname;

const buildPlugins = (variant, minify) => {
  const plugins = [
    resolve({
      preferBuiltins: false,
      // Support the browser field in dependencies' package.json.
      // Useful for the uuid package.
      mainFields: ["module", "main", "browser"],
    }),
    commonjs(),
    babel({
      envName: "rollup",
      babelHelpers: "bundled",
      configFile: path.resolve(dirname, "babel.config.cjs"),
    }),
  ];

  if (minify) {
    if (variant === BASE_CODE) {
      plugins.push(
        terser({
          mangle: true,
          compress: {
            unused: true,
          },
          output: {
            wrap_func_args: false,
          },
          toplevel: true,
        }),
      );
    } else {
      plugins.push(terser());
    }
  }

  if (variant === STANDALONE) {
    plugins.push(
      license({
        banner: {
          content: {
            file: path.join(dirname, "LICENSE_BANNER"),
          },
        },
      }),
    );
  }

  return plugins;
};

const buildConfig = (variant, minify) => {
  const plugins = buildPlugins(variant, minify);
  const minifiedExtension = minify ? ".min" : "";

  if (variant === BASE_CODE) {
    return {
      input: "src/baseCode.js",
      output: [
        {
          file: `distTest/baseCode${minifiedExtension}.js`,
          format: "cjs",
          strict: false,
        },
      ],
      plugins,
    };
  }
  if (variant === STANDALONE || variant === SANDBOX) {
    const destDirectory = variant === SANDBOX ? "sandbox/public/" : "dist/";

    return {
      input: "src/standalone.js",
      output: [
        {
          file: `${destDirectory}alloy${minifiedExtension}.js`,
          format: "iife",
          intro:
            "if (document.documentMode && document.documentMode < 11) {\n" +
            "  console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');\n" +
            "  return;\n" +
            "}\n",
          sourcemap: variant === SANDBOX,
        },
      ],
      plugins,
    };
  }

  // NPM_PACKAGE_LOCAL or NPM_PACKAGE_PROD
  const filename =
    variant === NPM_PACKAGE_LOCAL ? "npmPackageLocal" : "npmPackageProd";

  return {
    input: `test/functional/helpers/${filename}.js`,
    output: [
      {
        file: `distTest/${filename}${minifiedExtension}.js`,
        format: "iife",
      },
    ],
    plugins,
  };
};

const config = [];

const addConfig = (version) => {
  if (process.env[version]) {
    config.push(buildConfig(version, false));
  }
  if (process.env[`${version}_MIN`]) {
    config.push(buildConfig(version, true));
  }
};

addConfig(BASE_CODE);
addConfig(STANDALONE);
addConfig(SANDBOX);
addConfig(NPM_PACKAGE_LOCAL);
addConfig(NPM_PACKAGE_PROD);

if (config.length === 0) {
  throw new Error(
    "No files specified. Usage: rollup -c --environment BASE_CODE,STANDALONE,SANDBOX,NPM_PACKAGE_LOCAL,NPM_PACKAGE_PROD",
  );
}
export default config;
