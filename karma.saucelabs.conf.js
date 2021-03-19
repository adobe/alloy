const karmaSauceLauncher = require("karma-sauce-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = config => {
  karmaConfig(config);

  const customLaunchers = {
    sl_safari: {
      base: 'SauceLabs',
      browserName: 'safari',
      version: '12',
    },
    sl_edge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
    },
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '38',
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '40',
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '11',
    },
  };

  config.set({
    basePath: '',
    reporters: ['progress', 'saucelabs'],
    colors: true,
    concurrency: 5,
    sauceLabs: {
      testName: 'Alloy Unit Test',
      build: process.env.GITHUB_RUN_ID,
      recordScreenshots: false,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      // Must match with `.github/workflows/saucelabs.yml`
      connectOptions: {
        scproxyPort: 5757,
        logfile: 'sauce_connect.log',
      },
      public: 'public',
    },
    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      "karma-allure-reporter",
      karmaSauceLauncher
    ],
    // Increase timeout in case connection in CI is slow
    captureTimeout: 120000,
    customLaunchers,
    singleRun: true,
  });
};