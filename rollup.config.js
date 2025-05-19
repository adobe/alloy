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
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import path from "path";
import { defineConfig } from "rollup";
import license from "rollup-plugin-license";
import { fileURLToPath } from "url";
/* eslint-disable-next-line import/extensions -- Rollup needs the file extension */
import bundleSizePlugin from "./scripts/helpers/rollupBundleSizePlugin.js";

/**
 * @returns { Record<string, import('rollup').Plugin> & { shared: import('rollup').Plugin[] } }
 */
const createPlugins = ({ bundlesize }) => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const plugins = {
    bundlesize: bundleSizePlugin({
      output: "bundlesize.json",
    }),
    commonjs: commonjs(),
    json: json({
      preferConst: true,
    }),
    license: license({
      cwd: dirname,
      banner: {
        content: {
          file: path.join(dirname, "LICENSE_BANNER"),
        },
      },
    }),
    resolve: resolve(),
    terser: terser(),
  };
  plugins.shared = [plugins.resolve, plugins.commonjs, plugins.json];

  if (bundlesize) {
    plugins.shared.push(plugins.bundlesize);
  }

  return plugins;
};

/**
 * @param {Object} params
 * @param {boolean} params.bundlesize
 * @param {boolean} params.sourcemap
 * @returns {import('rollup').RollupOptions[]}
 */
export const createConfigs = (options = {}) => {
  const { bundlesize, sourcemap } = {
    bundlesize: Boolean(process.env.BUNDLESIZE),
    sourcemap: Boolean(process.env.SOURCEMAP),
    ...options,
  };

  const plugins = createPlugins({ bundlesize });

  const baseCodeBuild = defineConfig({
    input: "src/baseCode.js",
    output: [
      {
        file: "dist/baseCode.js",
        format: "es",
      },
      {
        file: "dist/baseCode.min.js",
        format: "es",
        plugins: [plugins.terser],
      },
    ],
    plugins: [...plugins.shared],
  });

  const standaloneBuild = defineConfig({
    input: "src/standalone.js",
    output: [
      {
        file: "dist/alloy.standalone.js",
        format: "iife",
        sourcemap,
      },
      {
        file: "dist/alloy.standalone.min.js",
        format: "iife",
        sourcemap,
        plugins: [plugins.terser],
      },
    ],
    plugins: [...plugins.shared, plugins.license],
  });

  const modularBuild = defineConfig({
    input: "src/index.js",
    output: [
      {
        file: "dist/alloy.cjs",
        format: "umd",
        name: "AdobeAlloy",
        sourcemap,
      },
      {
        file: "dist/alloy.js",
        format: "es",
        sourcemap,
        name: "AdobeAlloy",
      },
    ],
    plugins: [...plugins.shared],
  });

  const utilsBuild = defineConfig({
    input: "src/utils/index.js",
    output: [
      {
        file: "dist/utils.js",
        format: "es",
        sourcemap,
      },
      {
        file: "dist/utils.cjs",
        format: "cjs",
        sourcemap,
      },
    ],
    plugins: [...plugins.shared],
  });

  return [baseCodeBuild, standaloneBuild, modularBuild, utilsBuild];
};

export default createConfigs;

/**
 * @param {Object} options
 * @param {boolean} options.bundlesize
 * @param {boolean} options.sourcemap
 * @param {string} options.input
 * @param {string} options.outputFile
 * @param {boolean} options.minify
 * @returns {RollupOptions | RollupOptions[]}
 */
export const createCustomBuildConfig = (options = {}) => {
  const { bundlesize, sourcemap, input, outputFile, minify } = {
    bundlesize: Boolean(process.env.BUNDLESIZE),
    sourcemap: Boolean(process.env.SOURCEMAP),
    ...options,
  };
  const plugins = createPlugins();
  const rollupConfig = defineConfig({
    input,
    output: {
      file: outputFile,
      format: "iife",
      sourcemap,
    },
    plugins: [...plugins.shared, plugins.license],
  });

  if (bundlesize) {
    rollupConfig.plugins.push(plugins.bundlesize);
  }

  if (minify) {
    rollupConfig.plugins.push(plugins.terser);
  }

  return rollupConfig;
};
