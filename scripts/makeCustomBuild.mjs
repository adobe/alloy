import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import types from "@babel/types";
import moduleNames from "./moduleNames.mjs";
// eslint-disable-next-line import/extensions, import/no-named-as-default, import/no-named-as-default-member
import conditionalBuildBabelPlugin from "./conditionalBuildBabelPlugin.mjs";

const untouchableModules = ['context', 'privacy', 'identity'];

const argv = yargs(hideBin(process.argv))
    .scriptName("custom-builder")
    .usage(`$0 --exclude ${moduleNames.join(' ')}`)
    .option("exclude", {
      describe: "the modules that you want to be excluded from the build",
      choices: moduleNames,
      type: "array"
    })
    .array("exclude")
    .check((argv) => {
      const forbiddenExclusions = (argv.exclude || []).filter((module) => untouchableModules.includes(module));
      if (forbiddenExclusions.length > 0) {
        throw new Error(`You're not allowed to exclude the following modules: ${forbiddenExclusions.join(', ')}. Nice try, though.`);
      }
      return true;
    })
    .argv;

const buildConfig = (minify) => {
  const plugins = [
    nodeResolve({
      preferBuiltins: false,
      mainFields: ["module", "main", "browser"]
    }),
    commonjs(),
    babel({
      plugins: [
        conditionalBuildBabelPlugin(
            (argv.exclude || []).reduce((previousValue, currentValue) => {
              if (moduleNames.includes(currentValue)) {
                previousValue[`alloy_${currentValue}`] = "false";
              }
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
  const minifiedBuild = buildConfig(true);

  const bundleProd = await rollup(prodBuild);
  console.log("✔️ Built alloy.js");
  await bundleProd.write(prodBuild.output[0]);
  console.log(`✔️ Wrote alloy.js to ${prodBuild.output[0].file}`);

  const bundleMinified = await rollup(minifiedBuild);
  console.log("✔️ Built alloy.min.js");
  await bundleMinified.write(minifiedBuild.output[0]);
  console.log(`✔️ Wrote alloy.min.js to ${minifiedBuild.output[0].file}`);
};

buildWithComponents();