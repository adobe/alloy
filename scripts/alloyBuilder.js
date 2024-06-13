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
import { Command, Option, InvalidOptionArgumentError } from "commander";
import inquirer from "inquirer";
import { buildConfig } from "../rollup.config.js";
import conditionalBuildBabelPlugin from "./helpers/conditionalBuildBabelPlugin.js";
import components from "./helpers/alloyComponents.js";

const dirname = import.meta.dirname;
let sourceRootPath = `${dirname}/../src`;
if (!fs.existsSync(sourceRootPath)) {
  sourceRootPath = `${dirname}/../libEs6`;
}

const getOptionalComponents = (() => {
  const componentCreatorsPath = `${sourceRootPath}/core/componentCreators.js`;

  // Read componentCreators.js
  const componentCreatorsContent = fs.readFileSync(
    componentCreatorsPath,
    "utf8",
  );

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

  return () => optionalComponents;
})();

const getDefaultPath = () => {
  return process.cwd();
};

const getFile = (argv) => {
  return `${[argv.outputDir, `alloy${argv.minify ? ".min" : ""}.js`].join(path.sep)}`;
};

const getFileSizeInKB = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  return `${(fileSizeInBytes / 1024).toFixed(2)} K`;
};

const build = async (argv) => {
  const rollupConfig = buildConfig({
    input: sourceRootPath.includes("src")
      ? `${dirname}/../src/standalone.js`
      : `${dirname}/../libEs6/index.js`,
    file: getFile(argv),
    minify: argv.minify,
    babelPlugins: [
      conditionalBuildBabelPlugin(
        argv.exclude.reduce((acc, module) => {
          acc[`alloy_${module}`] = "false";
          return acc;
        }, {}),
      ),
    ],
  });

  const bundle = await rollup(rollupConfig);
  await bundle.write(rollupConfig.output[0]);
  console.log(
    `🎉 Wrote ${
      path.isAbsolute(argv.outputDir)
        ? rollupConfig.output[0].file
        : path.relative(process.cwd(), rollupConfig.output[0].file)
    } (${getFileSizeInKB(rollupConfig.output[0].file)}).`,
  );
};

const getMakeBuildCommand = () =>
  new Command("build")
    .description("Build a custom version of the alloy.js library.")
    .addOption(
      new Option(
        "-e, --exclude <modules...>",
        "optional components that can be excluded from the build",
      )
        .choices(getOptionalComponents())
        .default([])
        .argParser((value) => {
          const modules = value.split(",");

          modules.forEach((module) => {
            if (!getOptionalComponents().includes(module))
              throw new InvalidOptionArgumentError(
                `Module "${module}" does not exists. Allowed choices are "${getOptionalComponents().join('", "')}".`,
              );
          });

          return modules;
        }),
    )
    .addOption(new Option("-M, --no-minify", "disable code minification"))
    .addOption(
      new Option(
        "-o, --outputDir <dir>",
        "the output directory for the generated build",
      )
        .default(getDefaultPath())
        .argParser((value) => {
          if (!path.isAbsolute(value)) {
            value = `${getDefaultPath()}${path.sep}${value}`;
          }

          try {
            const stats = fs.statSync(value);
            if (!stats.isDirectory()) {
              throw new InvalidOptionArgumentError(
                `Output directory "${value}" is not a valid directory path.`,
              );
            }
          } catch (error) {
            throw new InvalidOptionArgumentError(
              `Output directory "${value}" is not a valid directory path. ${error.message}`,
            );
          }

          return value.replace(new RegExp(`${path.sep}+$`, "g"), "");
        }),
    )
    .action(async (opts) => {
      await build(opts);
    });

const getInteractiveBuildCommand = () =>
  new Command("interactive-build")
    .description(
      "Interactive process that will ask a series of questions and then it will generate a build.",
    )
    .action(async () => {
      await inquirer
        .prompt([
          {
            type: "checkbox",
            name: "include",
            message: "What components should be included in your Alloy build?",
            choices: components,
          },
          {
            type: "list",
            name: "minify",
            message: "How would you like your JavaScript to be?",
            choices: [
              { name: "Minified", value: true },
              { name: "Unminified", value: false },
            ],
          },
          {
            type: "string",
            name: "outputDir",
            message: "Where would you like to save the build?",
            default: process.cwd(),
          },
        ])
        .then(async (opts) => {
          const { include } = opts;
          const exclude = components
            .map((v) => v.value)
            .filter((component) => !include.includes(component));

          opts.exclude = exclude;
          delete opts.include;

          await build(opts);
        })
        .catch((error) => {
          if (error.isTtyError) {
            console.error(
              "Prompt couldn't be rendered in the current environment",
            );
          } else {
            console.error("An error occurred: ", error);
          }
        });
    });

const program = new Command();

program
  .name("alloy")
  .description(
    "Tool for generating custom Adobe Experience Platform Web SDK builds.",
  )
  .version("1.0.0");

program.addCommand(getMakeBuildCommand());
program.addCommand(getInteractiveBuildCommand(), { isDefault: true });
program.parse();
