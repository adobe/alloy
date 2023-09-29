import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import types from "@babel/types";
// eslint-disable-next-line import/extensions, import/no-named-as-default, import/no-named-as-default-member
import conditionalBuildBabelPlugin from "./conditionalBuildBabelPlugin.mjs";

const argv = yargs(hideBin(process.argv))
  .scriptName("custom-builder")
  .usage("$0 --exclude personalization audiences")
  .option("exclude", {
    describe: "the modules that you want to be excluded from the build",
    choices: ["personalization", "audiences"],
    type: "array"
  })
  .array("exclude").argv;

const buildConfig = (minify) => {
  const plugins = [
    nodeResolve({
      preferBuiltins: false,
      mainFields: ["module", "main", "browser"]
    }),
    commonjs(),
    babel({
      envName: "rollup",
      babelHelpers: "bundled",
      configFile: "./babel.config.js",
      plugins: [
        conditionalBuildBabelPlugin(
          (argv.exclude || []).reduce((previousValue, currentValue) => {
            previousValue[`alloy_${currentValue}`] = "false";
            return previousValue;
          }, {}),
          types
        )
      ]
    })
  ];

  if (minify) {
    plugins.push(terser());
  }

  return {
    input: "src/standalone.js",
    output: [
      {
        file: `dist/alloy${minify ? ".min" : ""}.js`,
        format: "iife",
        intro:
          "if (document.documentMode && document.documentMode < 11) {\n" +
          "  console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');\n" +
          "  return;\n" +
          "}\n",
        sourcemap: false
      }
    ],
    plugins
  };
};

const buildWithComponents = async () => {
  const prodBuild = buildConfig(false);

  // Build all configurations with Rollup
  const bundleProd = await rollup(prodBuild);
  console.log("✔️ Built alloy.js");
  await bundleProd.write(prodBuild.output[0]);
  console.log(`✔️ Wrote alloy.js to ${prodBuild.output[0].file}`);
};

buildWithComponents();
