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
const watch = process.argv.includes("--watch");
let specId = "Test"; // Default string to find in spec title.

const specIdArg = process.argv.find(arg => arg.includes("test="));

if (specIdArg) {
  const parts = specIdArg.split("=");
  specId = parts[1];
}

const browsers = isSauceLabs
  ? config.desktop.saucelabs
  : config.desktop.browser;

(async () => {
  const testcafe = await createTestCafe();
  const runner = watch
    ? testcafe.createLiveModeRunner()
    : testcafe.createRunner();

  const testFolder = config.desktop.testsFolder;
  const testSuite = allFilesSync(testFolder);

  const pageSnippet = `!function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||
    []).push(o),n[o]=function(){var u=arguments;return new Promise(
    function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}
    (window,["alloy"]);`;

  const failedCount = await runner
    .src(testSuite)
    .filter(testName => testName.includes(specId))
    .clientScripts(
      { content: pageSnippet },
      { path: process.cwd() + "/dist/standalone/alloy.js" }
    )
    .browsers(browsers)
    .run(runOptions);

  testcafe.close();
  process.exit(failedCount ? 1 : 0);
})();
