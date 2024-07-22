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

import path from "node:path";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import license from "rollup-plugin-license";
import { fileURLToPath } from "url";
import {
  gzip,
  brotliCompress as br,
  constants as zlibConstants,
} from "node:zlib";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";

/**
 * @param {Object} options
 * @param {string} [options.outputFile] Filepath to output the bundle size report.
 * @param {boolean} [options.reportToConsole] Whether to log the bundle size report to the console in addition to writing it to a file.
 * @param {number} [options.gzipCompressionLevel] The compression level to use when gzipping the bundle.
 * @param {number} [options.brotliCompressionLevel] The compression level to use when brotli-compressing the bundle.
 * @returns {Partial<import("rollup").PluginHooks>}
 */
const bundleSizePlugin = (_options = {}) => {
  const defaultOptions = {
    outputFile: "bundlesize.json",
    reportToConsole: false,
    gzipCompressionLevel: zlibConstants.Z_DEFAULT_COMPRESSION,
    brotliCompressionLevel: zlibConstants.BROTLI_DEFAULT_QUALITY,
  };
  const options = { ...defaultOptions, ..._options };
  const gzipCompress = promisify(gzip);
  const brotliCompress = promisify(br);
  /**
   * @param {import("node:zlib").InputType} source the source code to compress
   * @param {import("node:zlib").ZlibOptions={}} options
   * @returns {number} size in bytes
   */
  const getGzippedSize = async (source, opts = {}) => {
    const compressed = await gzipCompress(source, opts);
    const byteSize = Number.parseInt(compressed.byteLength, 10);
    return byteSize;
  };
  /**
   * @param {import("node:zlib").InputType} source the source code to compress
   * @param {import("node:zlib").BrotliOptions={}} options
   * @returns {number} size in bytes
   */
  const getBrotiliSize = async (source, opts = {}) => {
    const compressed = await brotliCompress(source, opts);
    const byteSize = Number.parseInt(compressed.byteLength, 10);
    return byteSize;
  };
  return {
    name: "bundle-size",
    generateBundle: {
      order: "post",
      /**
       * @param {import("rollup").NormalizedOutputOptions} rollupOptions
       * @param {import("rollup").OutputBundle} bundle
       * @returns {Promise<void>}
       */
      async handle(rollupOptions, bundle) {
        // keep sizes in bytes until displaying them
        const sizes = await Promise.all(
          Object.values(bundle)
            .filter((outputFile) => outputFile.type === "chunk")
            .map(async (chunk) => ({
              fileName: rollupOptions.file,
              uncompressedSize: Buffer.from(chunk.code).byteLength,
              gzippedSize: await getGzippedSize(chunk.code, {
                level: options.gzipCompressionLevel,
              }),
              brotiliSize: await getBrotiliSize(chunk.code, {
                params: {
                  [zlibConstants.BROTLI_PARAM_QUALITY]:
                    options.brotliCompressionLevel,
                },
              }),
            })),
        );
        if (options.reportToConsole) {
          console.table(sizes);
        }
        // check if the output file exists, create it if it does not exist
        let report = {};
        try {
          const outputFile = readFile(path.resolve(options.outputFile));
          report = JSON.parse(await outputFile);
        } catch {
          // ignore errors. They are probably due to the file not existing
        }
        // update the report with the new sizes
        sizes
          // stable sort the report by filename
          .sort(({ fileName: a }, { fileName: b }) => a.localeCompare(b))
          .forEach((size) => {
            const { fileName } = size;
            delete size.fileName;
            report[fileName] = size;
          });
        // write the report to the file
        await writeFile(
          path.resolve(options.outputFile),
          JSON.stringify(report, null, 2),
        );
      },
    },
  };
};
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

const dirname = path.dirname(fileURLToPath(import.meta.url));

const buildPlugins = ({ variant, minify, babelPlugins }) => {
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
      plugins: babelPlugins,
    }),
    bundleSizePlugin({
      output: "bundlesize.json",
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
