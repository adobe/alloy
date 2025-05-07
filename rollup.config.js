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
 * @returns { Record<string, RollupPlugin> & { shared: RollupPlugin[] } }
 */
const createPlugins = () => {
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
 * @returns {RollupOptions | RollupOptions[]}
 */
export const generateConfigs = (options = {}) => {
  const { bundlesize, sourcemap } = {
    bundlesize: Boolean(process.env.BUNDLESIZE),
    sourcemap: Boolean(process.env.SOURCEMAP),
    ...options,
  };

  const plugins = createPlugins();

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
        file: "dist/alloy.standalone.cjs",
        format: "umd",
        sourcemap,
      },
      {
        file: "dist/alloy.standalone.min.cjs",
        format: "umd",
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
    ],
    plugins: [...plugins.shared],
  });

  if (bundlesize) {
    // only add the bundlesize plugin to the umd output. ES output is many
    // small files and that would be a lot of noise in the bundlesize report.
    const umdOutput = modularBuild.output.find((o) => o.format === "umd");
    umdOutput.plugins = [...(umdOutput.plugins ?? []), plugins.bundlesize];

    standaloneBuild.plugins.push(plugins.bundlesize);
  }

  return [baseCodeBuild, standaloneBuild, modularBuild];
};

export default generateConfigs;

/**
 * @param {Object} options
 * @param {boolean} options.bundlesize
 * @param {boolean} options.sourcemap
 * @param {string} options.input
 * @param {string} options.outputFile
 * @param {boolean} options.minify
 * @returns {RollupOptions | RollupOptions[]}
 */
export const buildCustomBuildConfig = (options = {}) => {
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
