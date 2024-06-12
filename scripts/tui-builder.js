#!/usr/bin/env node

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

import inquirer from "inquirer";
import util from "util";
import { exec } from "child_process";
import components from "./helpers/alloyComponents.js";

const execAsync = util.promisify(exec);

inquirer
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
  .then(async (answers) => {
    const { include, minify, outputDir } = answers;
    const exclude = components
      .map((v) => v.value)
      .filter((component) => !include.includes(component));

    let params = `--outputDir ${outputDir}`;

    if (exclude.length > 0) {
      params += ` --exclude ${exclude.join(" ")}`;
    }

    if (!minify) {
      params += " --no-minify";
    }

    const resultPromise = execAsync(`npm run build:cli -- ${params}`);
    const output = await resultPromise;
    console.log(output.stdout);
  })
  .catch((error) => {
    if (error.isTtyError) {
      console.error("Prompt couldn't be rendered in the current environment");
    } else {
      console.error("An error occurred: ", error);
    }
  });
