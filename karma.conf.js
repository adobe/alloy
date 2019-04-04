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
const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();
const path = require("path");

const reporters = ["spec", "coverage"];
const rules = [
  {
    test: /\.js$/,
    include: path.resolve("src"),
    use: [
      {
        loader: "babel-loader"
      },
      {
        loader: "istanbul-instrumenter-loader",
        options: {
          esModules: true
        }
      }
    ]
  }
];

module.exports = config => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine", "jasmine-matchers"],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: "test.index.js",
        watched: false,
        included: true,
        served: true
      }
    ],

    // list of files to exclude
    exclude: ["**/*.spec.js"],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "test.index.js": ["webpack"]
    },

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters,

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],
    customLaunchers: {
        chrome_no_sandbox: {
            base: 'Chrome',
            flags: [
                '--no-sandbox'
            ]
        }
    },
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
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

    webpack: {
      mode: "development",
      devtool: "#inline-source-map",
      resolve: {
        extensions: [".js"]
      },
      module: {
        rules
      }
    }
  });
};
