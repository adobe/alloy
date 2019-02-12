const path = require("path");
const reporters = ["progress", "coverage"];
const rules = [{
  test: /\.js$/,
  include: path.resolve("src"),
  exclude: new RegExp("test"),
  loader: "istanbul-instrumenter-loader",
  query: {
    esModules: true
  }
}];

module.exports = function(config) {
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
    exclude: [
      "**/*.spec.js"
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "test.index.js": ["webpack"]
    },


    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,


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
    browsers: ["ChromeHeadless"],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

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
      externals: {
        window: "window",
        document: "document"
      },
      resolve: {
        extensions: [".js"]
      },
      module: {
        rules: rules
      }
    },

    webpackServer: {
      stats: true,
      debug: false,
      progress: true,
      quiet: false
    }
  })
};
