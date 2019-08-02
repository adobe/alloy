/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable func-style */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-useless-concat */

const createTestCafe = require("testcafe");
const fs = require("fs");
const path = require("path");
require("events").EventEmitter.prototype._maxListeners = 1000;
const { exec } = require("child_process");
const config = require("./localConfig");

let testcafe = null;
const group = config.desktop.group;
const allFilesSync = (dir, fileList = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);

    fileList.push(
      fs.statSync(filePath).isDirectory() ? allFilesSync(filePath) : filePath
    );
  });
  return fileList.filter(arr => {
    return arr.length !== 0;
  });
};
function cleanReports() {
  return new Promise((resolve, reject) => {
    // remove exisiting Allure reports.
    exec("rm -rf " + "allure", (err, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      resolve();
    });
    exec("rm -rf " + "reports", (err, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      resolve();
    });
  });
}
async function createReport() {
  console.log("Opening report .....");
  await exec(
    "allure generate allure/allure-results --clean -o allure/allure-report && allure open allure/allure-report",
    async (err, stdout, stderr) => {
      if (err) {
        console.log("couldn't execute the allure....");
        return;
      }
      await console.log(`stdout: ${stdout}`);
      await console.log(`stderr: ${stderr}`);
    }
  );
}
try {
  createTestCafe().then(tc => {
    testcafe = tc;
    const runner = testcafe.createRunner();
    runSuite = suite => {
      const runoptions = {
        skipJsErrors: config.desktop.skipCriticalConsoleJsErrors,
        quarantineMode: config.desktop.quarantineMode,
        speed: config.desktop.speed,
        debugMode: false,
        selectorTimeout: config.desktop.selectorTimeOut,
        assertionTimeout: config.desktop.assertionTimeout
      };
      return runner
        .src(suite)
        .filter(testName => /^smoke/.test(testName))
        .browsers(config.desktop.browser)
        .reporter("allure")
        .concurrency(config.desktop.concurrency)
        .run(runoptions)
        .catch(e => console.log("runner failed", e));
    };
    const testFolder = config.desktop.testsFolder;
    const testsList = allFilesSync(testFolder);
    console.log("Running tests under ", testsList);
    runSuite(testsList)
      .then(() => testcafe.close())
      .then(() => createReport());
  });
} catch (e) {
  console.error(e);
}
