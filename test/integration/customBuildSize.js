/* eslint-disable no-console */
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

/* eslint-disable no-console */

import { exec } from "child_process";
import fs from "fs";
import util from "util";

const execAsync = util.promisify(exec);

// Function to get file size in KB
const getFileSizeInKB = (filePath) => {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2); // Rounded to 2 decimal places
};

// Function to run the build excluding a component and log the size
const testExcludeComponent = async (component) => {
  try {
    await execAsync(`npm run build:custom -- --exclude ${component}`);
    // Assuming the output files are in the 'dist' directory
    const size = getFileSizeInKB(`../../dist/alloy.js`);
    const minSize = getFileSizeInKB(`../../dist/alloy.min.js`);
    console.log(
      `Build size excluding ${component}: ${size} KB, Minified: ${minSize} KB`,
    );
  } catch (error) {
    console.error(`Error excluding ${component}: ${error}`);
  }
};

// Components to test
const components = [
  "activitycollector",
  "audiences",
  "personalization",
  "eventmerge",
  "decisioningengine",
  "machinelearning",
];

// Run tests for all components
const runTests = async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const component of components) {
    // eslint-disable-next-line no-await-in-loop
    await testExcludeComponent(component);
  }
};

runTests();
