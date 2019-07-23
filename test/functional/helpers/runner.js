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

/* eslint-disable no-console */
const createTestCafe = require("testcafe");
const glob = require("glob");
const supportedBrowsers = require("./supportedBrowsers");
require("dotenv").config();

const browsers = () => {
  const envVar = "BROWSERS";
  return envVar in process.env
    ? process.env[envVar].split(",")
    : supportedBrowsers;
};

// Determine which test files to run
// Returns an array.
// Each element in the array is a group of tests.
// The tests are expected to be run sequentially and only continuing if the previous tests passed.
//
// For example, if no files are specified the first element will be the smoke test and the second will be the rest of the tests.
// This indicates that the smoke test should be run (to determine if there were any deployment or configuration issues) before proceeding with the more detailed tests.
const testFiles = () => {
  const envVar = "TEST_FILES";

  if (envVar in process.env) {
    return [glob.sync(process.env[envVar])];
  }

  return undefined;
};

const run = (listOfTests, listOfBrowsers = browsers()) => {
  let testcafe = null;
  createTestCafe("localhost", 1337, 1338)
    .then(tc => {
      testcafe = tc;
      const runner = testcafe.createRunner();

      if (listOfTests.length === 0) {
        return undefined;
      }
      const tests = listOfTests[0];

      if (!process.env.URL) {
        throw new ReferenceError(
          "URL environment variable is required to run tests"
        );
      }

      return runner
        .src(tests)
        .browsers(browsers())
        .run({ skipJsErrors: true });
    })
    .then(async failedCount => {
      console.log(`Tests failed: ${failedCount}`);
      await testcafe.close();
      if (failedCount === 0 && listOfTests.length > 1) {
        run(listOfTests.slice(1), listOfBrowsers);
      }
    })
    .catch(err => {
      console.error(err);
      testcafe.close();
    });
};

run(testFiles());
