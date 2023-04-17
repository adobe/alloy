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
import nodeResolve from "@rollup/plugin-node-resolve"; // Replace rollup-plugin-node-resolve
import commonjs from "@rollup/plugin-commonjs"; // Replace rollup-plugin-commonjs
import { babel } from "@rollup/plugin-babel";
import inject from "@rollup/plugin-inject";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";
import { visualizer } from "rollup-plugin-visualizer";

const VARIANTS = [
  "BASE_CODE",
  "STANDALONE",
  "SANDBOX",
  "NPM_PACKAGE_LOCAL",
  "NPM_PACKAGE_PROD"
];
const buildPlugins = (variant, minify) => {
  const plugins = [
    nodeResolve({
      preferBuiltins: false,
      mainFields: ["module", "main", "browser"]
    }),
    commonjs(),
    visualizer(),
    babel({
      envName: "rollup",
      configFile: path.resolve(__dirname, "babel.config.js")
    })
  ];

  if (minify) {
    if (variant === "BASE_CODE") {
      plugins.push(
        terser({
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/ // Mangle private properties starting with an underscore
            }
          },
          compress: {
            defaults: false,
            dead_code: true,
            unused: true,
            arguments: true,
            join_vars: true,
            drop_console: false,
            collapse_vars: true,
            reduce_vars: true,
            pure_getters: true,
            passes: 5 // Increase the number of optimization passes
          },
          output: {
            comments: false,
            wrap_func_args: false
          },
          toplevel: true
        })

        // terser({
        //   mangle: true,
        //   compress: {
        //     unused: true
        //   },
        //   output: {
        //     wrap_func_args: false
        //   },
        //   toplevel: true
        // })
      );
    } else {
      plugins.unshift(
        inject({
          include: "src/**",
          modules: {
            window: "window",
            document: "document",
            "JSON.stringify": "jsonStringify",
            "Object.keys": "objectKeys",
            "Promise.resolve": "promiseResolve",
            "Promise.reject": "promiseReject",
            "Promise.all": "promiseAll",
            Promise: "promise",
            Error: "error",
            undefined: "undefined"
          }
        })
      );
      plugins.push(terser());
    }
  }

  if (variant === "STANDALONE") {
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

const buildConfig = (variant, minify) => {
  const plugins = buildPlugins(variant, minify);
  const minifiedExtension = minify ? ".min" : "";

  if (variant === "BASE_CODE") {
    return {
      input: "src/baseCode.js",
      output: [
        {
          file: `distTest/baseCode${minifiedExtension}.js`,
          format: "iife",
          strict: false
        }
      ],
      plugins
    };
  }
  if (variant === "STANDALONE" || variant === "SANDBOX") {
    const destDirectory = variant === "SANDBOX" ? "sandbox/public/" : "dist/";

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
          globals: {
            window: "window",
            document: "document",
            jsonStringify: "JSON.stringify",
            objectKeys: "Object.keys",
            promiseResolve: "Promise.resolve",
            promiseReject: "Promise.reject",
            promiseAll: "Promise.all",
            promise: "Promise",
            error: "Error",
            undefined: "undefined"
          },
          sourcemap: variant === "SANDBOX",
          interop: false
        }
      ],
      external: [
        "window",
        "document",
        "jsonStringify",
        "objectKeys",
        "promiseResolve",
        "promiseReject",
        "promiseAll",
        "promise",
        "error",
        "undefined"
      ],

      plugins
    };
  }

  const filename =
    variant === "NPM_PACKAGE_LOCAL" ? "npmPackageLocal" : "npmPackageProd";

  return {
    input: `test/functional/helpers/${filename}.js`,
    output: [
      {
        file: `distTest/${filename}${minifiedExtension}.js`,
        format: "iife"
      }
    ],
    plugins
  };
};

const config = [];

const addConfig = version => {
  if (process.env[version]) {
    config.push(buildConfig(version, false));
  }
  if (process.env[`${version}_MIN`]) {
    config.push(buildConfig(version, true));
  }
};
VARIANTS.forEach(variant => addConfig(variant));

if (config.length === 0) {
  throw new Error(
    "No files specified. Usage: rollup -c --environment BASE_CODE,STANDALONE,SANDBOX,NPM_PACKAGE_LOCAL,NPM_PACKAGE_PROD"
  );
}

export default config;
