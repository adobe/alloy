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

import path from "path";
import { watch } from "rollup";
import createTestCafe from "testcafe";
import yargs from "yargs/yargs";
import { loadConfigFile } from "rollup/dist/loadConfigFile.js";
// eslint-disable-next-line import/extensions
import { hideBin } from "yargs/helpers";

const dirname = import.meta.dirname;

const argv = yargs(hideBin(process.argv)).option("browsers", {
  type: "array",
  default: ["chrome"],
}).argv;

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
    console.log(`Started bundling ${event.input} to ${event.output}`);
  },
  async BUNDLE_END(event) {
    console.log(`Finished bundling ${event.input} to ${event.output}`);
  },
  async END() {
    if (firstBuildComplete) {
      console.log(
        `Press Ctrl+R to restart the test run against the new build.`,
      );
    } else {
      firstBuildComplete = true;
      const testcafe = await createTestCafe();
      const liveRunner = testcafe.createLiveModeRunner();
      await liveRunner.browsers(argv.browsers).run();
      await testcafe.close();
    }
  },
  ERROR(event) {
    console.error(event.error.stack);
  },
};

(async () => {
  // Ideally we would pass these environment variables as part
  // of the loadConfigFile function, but that doesn't work.
  // See https://github.com/rollup/rollup/issues/4003
  process.env.STANDALONE = "true";
  process.env.NPM_PACKAGE_LOCAL = "true";
  process.env.BASE_CODE_MIN = "true";
  const { options, warnings } = await loadConfigFile(
    path.join(dirname, "../rollup.config.js"),
  );

  warnings.flush();
  const watcher = watch(options);
  watcher.on("event", (event) => {
    const effect = effectByEventCode[event.code];

    if (effect) {
      effect(event);
    }
  });
})();
