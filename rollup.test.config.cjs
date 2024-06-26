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

const path = require("path");
const resolve = require("@rollup/plugin-node-resolve");
const globImport = require("rollup-plugin-glob-import");
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("@rollup/plugin-babel");
const istanbul = require("rollup-plugin-istanbul");
const minimist = require("minimist");
const ignorePatterns = require("./coverageignore.cjs");

const argv = minimist(process.argv.slice(2));
const plugins = [
  globImport(),
  resolve({
    preferBuiltins: false,
    // Support the browser field in dependencies' package.json.
    // Useful for the uuid package.
    mainFields: ["module", "main", "browser"],
  }),
  commonjs(),
  babel({
    envName: "rollup",
    babelHelpers: "runtime",
    configFile: path.resolve(__dirname, "babel.test.config.cjs"),
  }),
];

if (argv.reporters && argv.reporters.split(",").includes("coverage")) {
  plugins.unshift(
    istanbul({
      exclude: ["test/unit/**", "node_modules/**"].concat(
        ignorePatterns.map((ignorePattern) => path.join("src", ignorePattern)),
      ),
    }),
  );
}

module.exports = {
  output: {
    dir: "distTest",
    name: "alloy",
    sourcemap: "inline",
    format: "iife",
    // Warn the user if they are using an unsupported browser.
    intro:
      "if (document.documentMode) { console.warn('The Adobe Experience Cloud Web SDK does not support Internet Explorer.'); return; }",
  },
  plugins,
};
