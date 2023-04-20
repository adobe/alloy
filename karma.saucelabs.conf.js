/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const karmaSauceLauncher = require("karma-sauce-launcher");
const karmaConfig = require("./karma.conf");

module.exports = config => {
  karmaConfig(config);
  const customLaunchers = {
    sl_chromeW3C: {
      base: "SauceLabs",
      browserName: "chrome",
      browserVersion: "latest",
      platform: "Windows 11"
    },
    sl_safariW3C: {
      base: "SauceLabs",
      browserName: "safari",
      browserVersion: "latest",
      platform: "macOS 11.00"
    },
    sl_firefoxW3C: {
      base: "SauceLabs",
      browserName: "firefox",
      platformName: "Windows 11",
      browserVersion: "latest",
      "sauce:options": {
        geckodriverVersion: "0.27.0"
      }
    },
    sl_edgeW3C: {
      base: "SauceLabs",
      browserName: "microsoftedge",
      browserVersion: "latest",
      platform: "Windows 11"
    }
  };

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers,
    concurrency: 10,
    colors: true,
    sauceLabs: {
      screenResolution: "800x600",
      build: `GH #${process.env.BUILD_NUMBER} (${process.env.BUILD_ID})`,
      tunnelIdentifier: process.env.JOB_NUMBER
    },
    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      karmaSauceLauncher
    ],

    reporters: ["dots", "saucelabs"]
  });
};
