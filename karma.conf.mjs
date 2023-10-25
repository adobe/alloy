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
const rollupConfig = require("./rollup.test.config.mjs");

const rollupConfig = require("./rollup.test.config.mjs");

module.exports = (config) => {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      "node_modules/promise-polyfill/dist/polyfill.js",
      {
        pattern: "test/unit/specs/karmaEntry.spec.js",
        watched: false
      }
    ],
    exclude: [],
    preprocessors: {
      "test/unit/specs/karmaEntry.spec.js": ["rollup"]
    },
    reporters: ["dots"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["FirefoxHeadless"],
    customLaunchers: {
      FirefoxHeadless: {
        base: "Firefox",
        flags: ["-headless"]
      }
    },
    singleRun: false,
    concurrency: Infinity,
    coverageReporter: {
      reporters: [
        { type: "html" },
        { type: "lcovonly", subdir: ".", file: "lcov.dat" }
      ]
    },
    captureTimeout: 180000,
    browserDisconnectTimeout: 180000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 300000,
    rollupPreprocessor: rollupConfig
  });
};