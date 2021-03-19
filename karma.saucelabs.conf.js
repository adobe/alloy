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
    browsers: Object.keys(customLaunchers),
    customLaunchers,

    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      karmaSauceLabsLauncher
    ],

    reporters: ["dots", "saucelabs"]
  });
};
