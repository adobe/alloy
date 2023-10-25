const resolve = require("@rollup/plugin-node-resolve").default;
const babel = require("@rollup/plugin-babel").babel;

const path = require("path");
const globImport = require("rollup-plugin-glob-import");
const commonjs = require("rollup-plugin-commonjs");
const istanbul = require("rollup-plugin-istanbul");
const minimist = require("minimist");
const ignorePatterns = require("./coverageignore");

const argv = minimist(process.argv.slice(2));
const plugins = [
  globImport(),
  resolve({
    preferBuiltins: false,
    mainFields: ["module", "main", "browser"]
  }),
  commonjs(),
  babel({
    envName: "rollup",
    babelHelpers: "runtime",
    configFile: path.resolve(__dirname, "babel.test.config.js")
  })
];

if (argv.reporters && argv.reporters.split(",").includes("coverage")) {
  plugins.unshift(
    istanbul({
      exclude: ["test/unit/**", "node_modules/**"].concat(
        ignorePatterns.map(ignorePattern => path.join("src", ignorePattern))
      )
    })
  );
}

module.exports = {
  output: {
    format: "iife",
    intro:
      "if (document.documentMode && document.documentMode < 11) { console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.'); return; }"
  },
  plugins
};
