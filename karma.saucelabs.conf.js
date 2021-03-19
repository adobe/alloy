const karmaSauceLauncher = require("karma-sauce-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = config => {
  karmaConfig(config);

  const customLaunchers = {
    sl_chromeW3C: {
      base: 'SauceLabs',
      browserName: 'chrome',
      browserVersion: 'latest',
      'sauce:options':{
        tags: ['w3c-chrome']
      }
    },
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
      "karma-allure-reporter",
      karmaSauceLauncher
    ],

    reporters: ["dots", "saucelabs"]
  });
};