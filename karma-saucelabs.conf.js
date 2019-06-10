const karmaSauceLauncher = require("karma-sauce-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = function(config) {
  karmaConfig(config);

  const customLaunchers = {
    sl_chrome_73: {
      base: "SauceLabs",
      browserName: "chrome",
      version: "73.0"
    },
    sl_osx_safari_11: {
      base: "SauceLabs",
      browserName: "safari",
      version: "11.1"
    },
    sl_firefox_66: {
      base: "SauceLabs",
      browserName: "firefox",
      version: "66.0"
    },
    sl_ie_11: {
      base: "SauceLabs",
      browserName: "internet explorer",
      platform: "Windows 10",
      version: "11.285"
    }
  };

  const sauceLabsAccessKey = process.env.SAUCE_ACCESS_KEY;

  config.set({
    browsers: Object.keys(customLaunchers),
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    browserConsoleLogOptions: {
      level: "log",
      format: "%b %T: %m",
      terminal: true
    },
    singleRun: true,
    customLaunchers,

    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-chrome-launcher",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      "karma-allure-reporter",
      karmaSauceLauncher
    ],

    reporters: ["spec", "saucelabs", "allure"],

    sauceLabs: {
      accessKey: sauceLabsAccessKey,
      connectOptions: {
        port: 4445,
        logfile: "sauce_connect.log"
      },
      recordScreenshots: false,
      recordVideo: false,
      startConnect: false,
      testName: "Alloy Tests",
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      username: process.env.SAUCE_USERNAME
    }
  });
};
