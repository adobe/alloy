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
import { fileURLToPath } from "url";
import babel from "@babel/core";
import { buildConfig } from "../rollup.config.js";
import entryPointGeneratorBabelPlugin from "./helpers/entryPointGeneratorBabelPlugin.js";
import optionalComponentsData from "./helpers/alloyOptionalComponents.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
let sourceRootPath = `${dirname}/../src`;
if (!fs.existsSync(sourceRootPath)) {
  sourceRootPath = `${dirname}/../libEs6`;
}

const arrayDifference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x));

const getOptionalComponents = (() => {
  const c = optionalComponentsData.map(({ component }) => component);
  return () => c;
})();

const getRequiredComponents = (() => {
  const code = fs.readFileSync(
    `${sourceRootPath}/core/componentCreators.js`,
    "utf-8",
  );

  const allComponents = [];
  babel.traverse(babel.parse(code), {
    Identifier(p) {
      if (p.node.name !== "default") {
        allComponents.push(p.node.name);
      }
    },
  });

  const optionalComponents = optionalComponentsData.map(
    ({ component }) => component,
  );
  const requiredComponents = arrayDifference(allComponents, optionalComponents);

  return () => requiredComponents;
})();

const getDefaultPath = () => {
  return process.cwd();
};

const getOutputFilePath = (argv) => {
  return `${[argv.outputDir, `alloy${argv.minify ? ".min" : ""}.js`].join(path.sep)}`;
};

const getFileSizeInKB = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  return `${(fileSizeInBytes / 1024).toFixed(2)} K`;
};

const generateInputEntryFile = ({
  inputPath,
  outputFile = "input.js",
  includedModules,
}) => {
  const code = fs.readFileSync(inputPath, "utf-8");

  const output = babel.transformSync(code, {
    plugins: [entryPointGeneratorBabelPlugin(babel.types, includedModules)],
  }).code;

  const destinationDirectory = path.dirname(inputPath);
  const outputPath = path.join(destinationDirectory, outputFile);

  fs.writeFileSync(outputPath, output);

  return outputPath;
};

const build = async (argv) => {
  const input = generateInputEntryFile({
    inputPath: `${sourceRootPath}/standalone.js`,
    includedModules: argv.include,
  });

  const rollupConfig = buildConfig({
    variant: "CUSTOM_BUILD",
    input,
    file: getOutputFilePath(argv),
    minify: argv.minify,
  });

  const bundle = await rollup(rollupConfig);
  await bundle.write(rollupConfig.output[0]);

  fs.unlinkSync(input);

  console.log(
    `🎉 Wrote ${
      path.isAbsolute(argv.outputDir)
        ? rollupConfig.output[0].file
        : path.relative(process.cwd(), rollupConfig.output[0].file)
    } (${getFileSizeInKB(rollupConfig.output[0].file)}).`,
  );
};

const getMakeBuildCommand = () => {
  const optionalComponentsParameters = getOptionalComponents();
  return new Command("build")
    .description("Build a custom version of the alloy.js library.")
    .addOption(
      new Option(
        "-e, --exclude <modules...>",
        "optional components that can be excluded from the build",
      )
        .choices(optionalComponentsParameters)
        .default([])
        .argParser((value) => {
          const modules = value.split(",");

          modules.forEach((module) => {
            if (!optionalComponentsParameters.includes(module))
              throw new InvalidOptionArgumentError(
                `Module "${module}" does not exists. Allowed choices are "${optionalComponentsParameters.join('", "')}".`,
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
    .action((opts) => {
      const { exclude } = opts;
      const optionalComponents = getOptionalComponents();
      delete opts.exclude;

      opts.include = arrayDifference(optionalComponents, exclude).concat(
        getRequiredComponents(),
      );
      return build(opts);
    });
};

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
            choices: optionalComponentsData.map(
              ({ name, component: value, checked = false }) => ({
                name,
                checked,
                value,
              }),
            ),
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
          opts.include = opts.include.concat(getRequiredComponents());
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
  .version("1.1.0");

program.addCommand(getMakeBuildCommand());
program.addCommand(getInteractiveBuildCommand(), { isDefault: true });
program.parse();
