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
import { input, checkbox, select } from "@inquirer/prompts";
import { fileURLToPath } from "url";
import babel from "@babel/core";
import { buildConfig } from "../rollup.config.js";
import entryPointGeneratorBabelPlugin from "./helpers/entryPointGeneratorBabelPlugin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonContent = fs.readFileSync(
  `${dirname}/../package.json`,
  "utf8",
);
const { version } = JSON.parse(packageJsonContent);

let sourceRootPath = `${dirname}/../src`;
if (!fs.existsSync(sourceRootPath)) {
  sourceRootPath = `${dirname}/../libEs6`;
}

const arrayDifference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x));

const camelCaseToTitleCase = (str) => {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
};

const getComponents = (() => {
  const components = {};
  [
    {
      filePath: `${sourceRootPath}/core/componentCreators.js`,
      key: "optional",
    },
    {
      filePath: `${sourceRootPath}/core/requiredComponentCreators.js`,
      key: "required",
    },
  ].forEach(({ filePath, key }) => {
    const code = fs.readFileSync(filePath, "utf-8");
    const c = [];

    babel.traverse(babel.parse(code), {
      Identifier(p) {
        if (p.node.name !== "default") {
          c.push(p.node.name);
        }
      },
    });

    components[key] = c;
  });

  return () => components;
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
  const output = babel.transformFileSync(inputPath, {
    plugins: [entryPointGeneratorBabelPlugin(babel.types, includedModules)],
  }).code;

  const destinationDirectory = path.dirname(inputPath);
  const outputPath = path.join(destinationDirectory, outputFile);

  fs.writeFileSync(outputPath, output);

  return outputPath;
};

const build = async (argv) => {
  const inputFile = generateInputEntryFile({
    inputPath: `${sourceRootPath}/standalone.js`,
    includedModules: argv.include,
  });

  const rollupConfig = buildConfig({
    variant: "CUSTOM_BUILD",
    input: inputFile,
    file: getOutputFilePath(argv),
    minify: argv.minify,
  });

  const bundle = await rollup(rollupConfig);
  await bundle.write(rollupConfig.output[0]);

  fs.unlinkSync(inputFile);

  console.log(
    `🎉 Wrote ${
      path.isAbsolute(argv.outputDir)
        ? rollupConfig.output[0].file
        : path.relative(process.cwd(), rollupConfig.output[0].file)
    } (${getFileSizeInKB(rollupConfig.output[0].file)}).`,
  );
};

const getMakeBuildCommand = () => {
  const optionalComponentsParameters = getComponents().optional;
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
      const optionalComponents = getComponents().optional;
      delete opts.exclude;

      opts.include = arrayDifference(optionalComponents, exclude);
      return build(opts);
    });
};

const getInteractiveBuildCommand = () =>
  new Command("interactive-build")
    .description(
      "Interactive process that will ask a series of questions and then it will generate a build.",
    )
    .action(async () => {
      try {
        const opts = {
          include: await checkbox({
            message: "What components should be included in your Alloy build?",
            choices: getComponents().optional.map((value) => ({
              name: camelCaseToTitleCase(value),
              checked: true,
              value,
            })),
          }),
          minify: await select({
            message: "How would you like your JavaScript to be?",
            choices: [
              { name: "Minified", value: true },
              { name: "Unminified", value: false },
            ],
          }),
          outputDir: await input({
            message: "Where would you like to save the build?",
            default: process.cwd(),
          }),
        };

        build(opts);
      } catch (error) {
        if (error.isTtyError) {
          console.error(
            "Prompt couldn't be rendered in the current environment",
          );
        } else if (error.name !== "ExitPromptError") {
          console.error("An error occurred: ", error);
        }
      }
    });

const program = new Command();

program
  .name("alloy")
  .description(
    "Tool for generating custom Adobe Experience Platform Web SDK builds.",
  )
  .version(version);

program.addCommand(getMakeBuildCommand());
program.addCommand(getInteractiveBuildCommand(), { isDefault: true });
program.parse();
