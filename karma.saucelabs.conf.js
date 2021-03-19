const puppeteer = require("puppeteer");
const rollupConfig = require("./rollup.test.config");

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function (config) {
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.')
    process.exit(1)
  }

  const customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: 'latest',
      tags: ['jsonwp-chrome']
    },
    sl_chromeW3C: {
      base: 'SauceLabs',
      browserName: 'chrome',
      browserVersion: 'latest',
      'sauce:options':{
        tags: ['w3c-chrome']
      }
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: 'latest',
      tags: ['jsonwp-firefox']
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: 'latest',
      tags: ['jsonwp-ie11']
    }
  };

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      "node_modules/promise-polyfill/dist/polyfill.js",
      {
        pattern: "test/unit/specs/karmaEntry.spec.js",
        watched: false // The preprocessor will use its own watcher
      }
    ],
    preprocessors: {
      "test/unit/specs/karmaEntry.spec.js": ["rollup"]
    },
    plugins: [      
      "karma-jasmine",
      "karma-coverage",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      "karma-allure-reporter", 
      'karma-sauce-launcher'
    ],
    reporters: ['dots', 'saucelabs'],
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
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true
  })
};