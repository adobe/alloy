/* eslint-disable */
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
require("dotenv").config();
const createTestCafe = require("testcafe");
const fs = require("fs");
const path = require("path");

const config = require("./localConfig");

let testcafe = null;

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

const runOptions = {
  skipJsErrors: config.desktop.skipCriticalConsoleJsErrors,
  quarantineMode: config.desktop.quarantineMode,
  speed: config.desktop.speed,
  debugMode: false,
  selectorTimeout: config.desktop.selectorTimeOut,
  assertionTimeout: config.desktop.assertionTimeout
};

const isSauceLabs = process.argv.includes("--sl");
const browsers = isSauceLabs
  ? config.desktop.saucelabs
  : config.desktop.browser;

createTestCafe()
  .then(tc => {
    testcafe = tc;
    const runner = testcafe.createRunner();
    const testFolder = config.desktop.testsFolder;
    const testSuite = allFilesSync(testFolder);

    return runner
      .src(testSuite)
      .filter(testName => /^Regression/.test(testName))
      .browsers(browsers)
      .reporter("spec")
      .concurrency(config.desktop.concurrency)
      .run(runOptions);
  })
  .then(numberOfFailedTests => {
    console.log("Failed tests: ", numberOfFailedTests);
    testcafe.close();
  });
