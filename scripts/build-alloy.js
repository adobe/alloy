#!/usr/bin/env node

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
import yargs from "yargs/yargs";
// eslint-disable-next-line import/extensions
import { hideBin } from "yargs/helpers";
import conditionalBuildBabelPlugin from "./helpers/conditionalBuildBabelPlugin.js";
import { buildConfig } from "../rollup.config.js";

const dirname = import.meta.dirname;

// Path to componentCreators.js
const componentCreatorsPath = path.join(
  dirname,
  "../src/core/componentCreators.js",
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

const getDefaultPath = () => {
  return process.cwd();
};

const argv =
  // .coerce("outputDir", (opt) => {
  //   console.log("aa", opt);
  //   return !opt ? process.cwd() : `${process.cwd()}${path.sep}${opt}`;
  // })
  yargs(hideBin(process.argv))
    .scriptName("build-alloy")
    .example([
      [`$0 --exclude ${optionalComponents.slice(0, 2).join(" ")}`],
      [`$0 --minify --exclude ${optionalComponents.slice(0, 2).join(" ")}`],
    ])
    .option("exclude", {
      describe: "components that can be excluded from the build",
      choices: optionalComponents,
      type: "array",
      alias: "e",
      default: [],
    })
    .option("minify", {
      type: "boolean",
      default: false,
      alias: "m",
    })
    .option("outputDir", {
      alias: "o",
      default: getDefaultPath(),
    })
    .coerce("outputDir", (opt) => {
      if (opt !== getDefaultPath()) {
        opt = `${getDefaultPath()}${path.sep}${opt}`;
      }

      try {
        const stats = fs.statSync(opt);
        if (!stats.isDirectory()) {
          throw new Error("Output directory must be a valid directory path.");
        }
      } catch (error) {
        throw new Error("Output directory must be a valid directory path.");
      }

      return opt.replace(new RegExp(`${path.sep}+$`, "g"), "");
    }).argv;

const getFile = () => {
  return `${[argv.outputDir, `alloy${argv.minify ? ".min" : ""}.js`].join(path.sep)}`;
};

const getFileSizeInKB = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  return `${(fileSizeInBytes / 1024).toFixed(2)} K`;
};

const buildWithComponents = async () => {
  const rollupConfig = buildConfig({
    file: getFile(),
    minify: argv.minify,
    babelPlugins: [
      conditionalBuildBabelPlugin(
        argv.exclude.reduce((acc, module) => {
          acc[`alloy_${module} `] = "false";
          return acc;
        }, {}),
      ),
    ],
  });

  const bundle = await rollup(rollupConfig);
  await bundle.write(rollupConfig.output[0]);
  console.log(
    `🎉 Wrote ${path.relative(
      process.cwd(),
      rollupConfig.output[0].file,
    )} (${getFileSizeInKB(rollupConfig.output[0].file)}).`,
  );
};

buildWithComponents();
