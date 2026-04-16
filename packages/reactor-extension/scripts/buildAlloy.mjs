/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// This file will be used by Tags in order to generate a custom Alloy build based on user options.
// Tags doesn't support ES6 modules, so we need to compile to CommonJS modules here.
import path, { dirname } from "path";
import fs from "fs";
import { spawn, execSync } from "child_process";
import { Command, Option, InvalidOptionArgumentError } from "commander";
import babel from "@babel/core";
import { fileURLToPath } from "url";
import alloyComponents, {
  isDefaultComponent,
} from "../src/view/utils/alloyComponents.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const execute = (command, options) => {
  return new Promise((resolve, reject) => {
    spawn(command, options, {
      stdio: "inherit",
    })
      .on("exit", resolve)
      .on("error", reject);
  });
};

const getPackageManager = () => {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    return "pnpm";
  } catch {
    return "npm";
  }
};

const entryPointGeneratorBabelPlugin = (t, includedModules) => ({
  visitor: {
    VariableDeclarator(babelPath) {
      if (babelPath.node.id.name === "components") {
        babelPath.replaceWith(
          t.VariableDeclarator(
            t.Identifier("components"),
            t.ArrayExpression(
              includedModules.map((module) =>
                t.MemberExpression(
                  t.Identifier("optionalComponents"),
                  t.Identifier(module),
                ),
              ),
            ),
          ),
        );

        babelPath.stop();
      }
    },
  },
});

const addAlloyModulesToEntryFile = ({
  inputFile,
  outputDir,
  includedModules,
}) => {
  const output = babel.transformFileSync(inputFile, {
    plugins: [entryPointGeneratorBabelPlugin(babel.types, includedModules)],
  }).code;

  const filename = path.basename(inputFile);
  const outputPath = path.join(outputDir, filename);

  fs.writeFileSync(outputPath, output);

  return outputPath;
};

const program = new Command();

program
  .name("buildCustomAlloy")
  .description("Tool for generating custom alloy build based on user input.");

program.addOption(
  new Option("-i, --inputFile <file>", "the entry point file for the build")
    .makeOptionMandatory()
    .argParser((value) => {
      if (!fs.existsSync(path.join(process.cwd(), value))) {
        throw new InvalidOptionArgumentError(
          `Input file "${value}" does not exist.`,
        );
      }

      return value;
    }),
);

program.addOption(
  new Option(
    "-o, --outputDir <dir>",
    "the output directory for the generated build",
  )
    .default(process.cwd())
    .argParser((value) => {
      if (!fs.existsSync(path.join(process.cwd(), value))) {
        throw new InvalidOptionArgumentError(
          `Output directory "${value}" is not a valid directory path.`,
        );
      }

      return value;
    }),
);

Object.keys(alloyComponents).forEach((component) => {
  const isDefault = isDefaultComponent(component);
  program.addOption(
    new Option(`--${component} <bool>`, `enable ${component} module`)
      .env(`ALLOY_${component.toUpperCase()}`)
      .default(isDefault, Boolean(isDefault).toString())
      .argParser((val) => {
        if (val === "0" || val === "false") {
          return false;
        }

        return true;
      }),
  );
});

program.action(async ({ inputFile, outputDir, ...modules }) => {
  const includedModules = Object.entries(modules).reduce(
    (acc, [key, value]) => {
      if (value === true) {
        acc.push(key);
      }

      return acc;
    },
    [],
  );

  // eslint-disable-next-line no-console
  console.log("Generating build with modules: ", includedModules.join(", "));

  let entryFile;
  try {
    entryFile = addAlloyModulesToEntryFile({
      inputFile,
      outputDir,
      includedModules,
    });

    await execute(getPackageManager(), [
      "exec",
      "--",
      "rollup",
      "-c",
      path.join(__dirname, "../rollup.config.mjs"),
      "-i",
      entryFile,
      "-o",
      entryFile,
    ]);

    const output = babel.transformFileSync(entryFile, {
      presets: [["@babel/preset-env"]],
    }).code;

    fs.writeFileSync(entryFile, output);
  } catch (e) {
    fs.unlinkSync(entryFile);
    console.error(e);
    process.exit(1);
  }
});

program.parse();
