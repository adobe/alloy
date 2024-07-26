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
import { fileURLToPath } from "url";

const BASE_CODE = "BASE_CODE";
const STANDALONE = "STANDALONE";
const SANDBOX = "SANDBOX";
const NPM_PACKAGE_LOCAL = "NPM_PACKAGE_LOCAL";
const NPM_PACKAGE_PROD = "NPM_PACKAGE_PROD";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const buildPlugins = ({ variant, minify, babelPlugins }) => {
  const plugins = [
    resolve({
      preferBuiltins: false,
      mainFields: ["module", "main", "browser"],
    }),
    commonjs(),
    babel({
      envName: "rollup",
      babelHelpers: "bundled",
      configFile: path.resolve(dirname, "babel.config.cjs"),
      plugins: babelPlugins,
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
        cwd: dirname,
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

export const buildConfig = ({
  variant = STANDALONE,
  minify = false,
  babelPlugins = [],
  input = `${dirname}/src/standalone.js`,
  file,
}) => {
  const plugins = buildPlugins({ variant, minify, babelPlugins });
  const minifiedExtension = minify ? ".min" : "";

  console.log(`Building config for variant: ${variant}`);
  console.log(`Input path: ${input}`);
  console.log(
    `Output file: ${file || `${variant === SANDBOX ? "sandbox/public/" : "dist/"}alloy${minifiedExtension}.js`}`,
  );

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
      input,
      output: [
        {
          file: file || `${destDirectory}alloy${minifiedExtension}.js`,
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

const addConfig = (variant) => {
  if (process.env[variant]) {
    config.push(buildConfig({ variant, minify: false }));
  }
  if (process.env[`${variant}_MIN`]) {
    config.push(buildConfig({ variant, minify: true }));
  }
};

addConfig(BASE_CODE);
addConfig(STANDALONE);
addConfig(SANDBOX);
addConfig(NPM_PACKAGE_LOCAL);
addConfig(NPM_PACKAGE_PROD);

export default config;
