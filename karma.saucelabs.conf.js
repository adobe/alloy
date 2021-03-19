const karmaSauceLabsLauncher = require("karma-sauce-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = config => {
  karmaConfig(config);

  const customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'Chrome',
      version: 'latest'
    },
    sl_safari: {
      base: 'SauceLabs',
      browserName: 'Safari',
      browserVersion: 'latest'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'Firefox',
      version: 'latest'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'IE',
      version: 'latest'
    }
  };

  config.set({
    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      karmaSauceLabsLauncher
    ],
    reporters: ["dots", "saucelabs"],
    port: 9876,
    colors: true,
    sauceLabs: {
      testName: 'Alloy Unit Test',
      recordScreenshots: false,
      connectOptions: {
        logfile: 'sauce_connect.log'
      },
      public: 'public'
    },
    // Increase timeout in case connection in CI is slow
    captureTimeout: 120000,
    browsers: Object.keys(customLaunchers),
    customLaunchers,
    singleRun: true
  });
};
