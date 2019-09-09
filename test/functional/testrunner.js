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
const environment = process.env.baseurl;
const createTestCafe = require("testcafe");
const fs = require("fs");
const path = require("path");
require("events").EventEmitter.prototype._maxListeners = 1000;
const { exec } = require("child_process");
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

cleanReports = () => {
  return new Promise(resolve => {
    exec("rm -rf allure", () => {
      resolve();
    });
    exec("rm -rf reports", () => {
      resolve();
    });
  });
};

createReport = () => {
  exec(
    "allure generate allure/allure-results --clean -o allure/allure-report",
    () => {}
  );
};

const isSL = process.argv.includes("--sl");
if (environment === "dev" && isSL === false) {
  createTestCafe().then(tc => {
    testcafe = tc;
    const runner = testcafe.createRunner();
    runSuite = suite => {
      const runOptions = {
        skipJsErrors: config.desktop.skipCriticalConsoleJsErrors,
        quarantineMode: config.desktop.quarantineMode,
        speed: config.desktop.speed,
        debugMode: false,
        selectorTimeout: config.desktop.selectorTimeOut,
        assertionTimeout: config.desktop.assertionTimeout
      };
      return runner
        .src(suite)
        .filter(testName => /^Regression/.test(testName))
        .browsers(config.desktop.browser)
        .reporter("allure")
        .concurrency(config.desktop.concurrency)
        .run(runOptions);
    };
    const testFolder = config.desktop.testsFolder;
    const testsList = allFilesSync(testFolder);
    runSuite(testsList)
      .then(() => testcafe.close())
      .then(() => createReport());
  });
} else if (environment === "prod" && isSL === false) {
  createTestCafe().then(tc => {
    testcafe = tc;
    const runner = testcafe.createRunner();
    runSuite = suite => {
      const runOptions = {
        skipJsErrors: config.desktop.skipCriticalConsoleJsErrors,
        quarantineMode: config.desktop.quarantineMode,
        speed: config.desktop.speed,
        debugMode: false,
        selectorTimeout: config.desktop.selectorTimeOut,
        assertionTimeout: config.desktop.assertionTimeout
      };
      return runner
        .src(suite)
        .filter(testName => /^Regression/.test(testName))
        .browsers(config.desktop.browser)
        .reporter("allure")
        .concurrency(config.desktop.concurrency)
        .run(runOptions);
    };
    const testFolder = config.desktop.testsFolder;
    const testsList = allFilesSync(testFolder);
    runSuite(testsList)
      .then(() => testcafe.close())
      .then(() => createReport());
  });
} else if (environment === "dev" && isSL === true) {
  createTestCafe().then(tc => {
    testcafe = tc;
    const runner = testcafe.createRunner();
    runSuite = suite => {
      const runOptions = {
        skipJsErrors: config.desktop.skipCriticalConsoleJsErrors,
        quarantineMode: config.desktop.quarantineMode,
        speed: config.desktop.speed,
        debugMode: false,
        selectorTimeout: config.desktop.selectorTimeOut,
        assertionTimeout: config.desktop.assertionTimeout
      };
      return runner
        .src(suite)
        .filter(testName => /^Regression/.test(testName))
        .browsers(config.desktop.saucelabs)
        .reporter("allure")
        .concurrency(config.desktop.concurrency)
        .run(runOptions);
    };
    const testFolder = config.desktop.testsFolder;
    const testsList = allFilesSync(testFolder);
    runSuite(testsList)
      .then(() => testcafe.close())
      .then(() => createReport());
  });
} else if (environment === "prod" && isSL === true) {
  createTestCafe().then(tc => {
    testcafe = tc;
    const runner = testcafe.createRunner();
    runSuite = suite => {
      const runOptions = {
        skipJsErrors: config.desktop.skipCriticalConsoleJsErrors,
        quarantineMode: config.desktop.quarantineMode,
        speed: config.desktop.speed,
        debugMode: false,
        selectorTimeout: config.desktop.selectorTimeOut,
        assertionTimeout: config.desktop.assertionTimeout
      };
      return runner
        .src(suite)
        .filter(testName => /^Regression/.test(testName))
        .browsers(config.desktop.saucelabs)
        .reporter("allure")
        .concurrency(config.desktop.concurrency)
        .run(runOptions);
    };
    const testFolder = config.desktop.testsFolder;
    const testsList = allFilesSync(testFolder);
    runSuite(testsList)
      .then(() => testcafe.close())
      .then(() => createReport());
  });
} else {
  console.log("env is missing");
}
