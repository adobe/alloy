/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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
        if (!argv.exclude) {
            console.log(`Please provide the --exclude option with one or more of the following modules: ${moduleNames.join(', ')}.`);
            process.exit(1);
        }
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