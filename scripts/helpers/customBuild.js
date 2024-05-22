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

import fs from "fs";
import path from "path";
import { rollup } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import yargs from "yargs/yargs";
// eslint-disable-next-line import/extensions
import { hideBin } from "yargs/helpers";
import conditionalBuildBabelPlugin from "./conditionalBuildBabelPlugin.js";

const dirname = import.meta.dirname;

// Path to componentCreators.js
const componentCreatorsPath = path.join(
  dirname,
  "../../src/core/componentCreators.js",
);

// Read componentCreators.js
const componentCreatorsContent = fs.readFileSync(componentCreatorsPath, "utf8");

// Extract optional components based on @skipwhen directive
const optionalComponents = componentCreatorsContent
  .split("\n")
  .filter((line) => line.trim().startsWith("/* @skipwhen"))
  .map((line) => {
    const match = line.match(/ENV\.alloy_([a-zA-Z0-9]+) === false/);
    if (match) {
      const [, componentName] = match;
      return componentName.toLowerCase(); // Ensure this matches the expected format for exclusion
    }
    return null;
  })
  .filter(Boolean);

console.log("Optional Components:", optionalComponents); // Debugging line

const argv = yargs(hideBin(process.argv))
  .scriptName("build:custom")
  .usage(`$0 --exclude ${optionalComponents.join(" ")}`)
  .option("exclude", {
    describe: "the components that you want to be excluded from the build",
    choices: optionalComponents,
    type: "array",
  })
  .array("exclude")
  .check(() => {
    // No need to check for required components as we're using @skipwhen to determine optionality
    return true;
  }).argv;

if (!argv.exclude) {
  console.log(
    `No components excluded. To exclude components, try running "npm run build:custom -- --exclude personalization". Your choices are: "${optionalComponents.join(
      '", "',
    )}".`,
  );
  process.exit(0);
}

const buildConfig = (minify, sandbox) => {
  const plugins = [
    nodeResolve({
      preferBuiltins: false,
      mainFields: ["component", "main", "browser"],
    }),
    commonjs(),
    babel({
      plugins: [
        conditionalBuildBabelPlugin(
          (argv.exclude || []).reduce((previousValue, currentValue) => {
            previousValue[`alloy_${currentValue}`] = "false";
            return previousValue;
          }, {}),
        ),
      ],
    }),
  ];
  if (minify) {
    plugins.push(terser());
  }
  let filename = `dist/alloy${minify ? ".min" : ""}.js`;
  if (sandbox) {
    filename = `sandbox/public/alloy${minify ? ".min" : ""}.js`;
  }
  return {
    input: "src/standalone.js",
    output: [
      {
        file: filename,
        format: "iife",
        intro:
          "if (document.documentMode && document.documentMode < 11) {\n" +
          "  console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');\n" +
          "  return;\n" +
          "}\n",
        sourcemap: false,
      },
    ],
    plugins,
  };
};

const getFileSizeInKB = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  return (fileSizeInBytes / 1024).toFixed(2);
};

const buildWithComponents = async (sandbox) => {
  const prodBuild = buildConfig(false, sandbox);
  const minifiedBuild = buildConfig(true, sandbox);

  const bundleProd = await rollup(prodBuild);
  console.log("✔️ Built alloy.js");
  await bundleProd.write(prodBuild.output[0]);
  console.log(`✔️ Wrote alloy.js to ${prodBuild.output[0].file}`);
  console.log(`📏 Size: ${getFileSizeInKB(prodBuild.output[0].file)} KB`);

  const bundleMinified = await rollup(minifiedBuild);

  console.log("✔️ Built alloy.min.js");
  await bundleMinified.write(minifiedBuild.output[0]);
  console.log(`✔️ Wrote alloy.min.js to ${minifiedBuild.output[0].file}`);
  console.log(`📏 Size: ${getFileSizeInKB(minifiedBuild.output[0].file)} KB`);
};

buildWithComponents(!!process.env.SANDBOX);
