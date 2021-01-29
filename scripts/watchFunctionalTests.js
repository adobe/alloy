#!/usr/bin/env node

/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const path = require("path");
const rollup = require("rollup");
const loadConfigFile = require("rollup/dist/loadConfigFile");
const createTestCafe = require("testcafe");

/**
 * This script produces a build of Alloy from the source, then starts functional
 * tests using TestCafe. It runs functional tests in watch mode, so if any of
 * the test files get updated, TestCafe will automatically re-run tests.
 * TestCafe has no way to watch for changes to *source* files, however, so this
 * script also watches for changes to source files and, when a change is seen,
 * reproduces an Alloy build. In this case, tests won't be re-run
 * automatically, but the developer should be able to hit Ctrl+R after the
 * new build is produced to re-run tests.
 */

let firstBuildComplete = false;

const effectByEventCode = {
  BUNDLE_START(event) {
    console.log(`Bundling ${event.input} to ${event.output}`);
  },
  async BUNDLE_END(event) {
    console.log(`Bundled ${event.input} to ${event.output}`);
    if (firstBuildComplete) {
      console.log(
        `Press Ctrl+R to restart the test run against the new build.`
      );
    } else {
      firstBuildComplete = true;
      const testcafe = await createTestCafe();
      const liveRunner = testcafe.createLiveModeRunner();
      await liveRunner.browsers(["chrome"]).run();
      await testcafe.close();
    }
  },
  ERROR(event) {
    console.error(event.error.stack);
  }
};

(async () => {
  const { options, warnings } = await loadConfigFile(
    path.join(__dirname, "../rollup.config.js"),
    { environment: "BASE_CODE,NPM_PACKAGE_LOCAL" }
  );

  warnings.flush();

  const watcher = rollup.watch(options);
  watcher.on("event", event => {
    const effect = effectByEventCode[event.code];

    if (effect) {
      effect(event);
    }
  });
})();
