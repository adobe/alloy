/**
 * Differences between the new and old rollup.config.js:
 * 1. All build files should be generated into the dist/ directory
 * 2. The sandbox and tests will use the npm es6 dist outputs
 * 3.
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
 * @returns { Record<string, RollupPlugin> }
 */
const buildPlugins = () => {
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

  return plugins;
};

/**
 * @param {Object} params
 * @param {boolean} params.bundlesize
 * @param {boolean} params.sourcemap
 * @returns {Promise<RollupOptions | RollupOptions[]>}
 */
const generateConfigs = ({ bundlesize, sourcemap }) => {
  const plugins = buildPlugins();
  const baseCodeBuild = defineConfig({
    input: "src/baseCode.js",
    output: [
      {
        file: "dist/baseCode.js",
      },
      {
        file: "dist/baseCode.min.js",
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

  if (bundlesize) {
    standaloneBuild.plugins.push(plugins.bundlesize);
  }

  const modularBuild = defineConfig({
    input: "src/index.js",
    output: [
      {
        file: "dist/alloy.cjs",
        format: "cjs",
        sourcemap,
      },
      {
        dir: "dist/",
        format: "es",
        sourcemap,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
    plugins: [...plugins.shared],
  });

  return [baseCodeBuild, standaloneBuild, modularBuild];
};

/**
 * Translate from env variables to the rollup config.
 *
 * @typedef {import("rollup").RollupOptions} RollupOptions
 * @returns {Promise<RollupOptions | RollupOptions[]>}
 */
const getConfig = async () => {
  const bundlesize = Boolean(process.env.BUNDLESIZE);
  const sourcemap = Boolean(process.env.SOURCEMAP);
  return generateConfigs({ sourcemap, bundlesize });
};

export default getConfig;
