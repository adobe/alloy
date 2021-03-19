const karmaSauceLabsLauncher = require("karma-saucelabs-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = config => {
  karmaConfig(config);

  const customLaunchers = {
    bs_chrome_windows: {
      base: "SauceLabs",
      browser: "chrome",
      browser_version: "latest"
    },
    bs_safari_macos: {
      base: "SauceLabs",
      browser: "Safari",
      browser_version: "latest"
    },
    bs_firefox_windows: {
      base: "SauceLabs",
      browser: "firefox",
      browser_version: "latest"
    },
    bs_ie_windows: {
      base: "SauceLabs",
      browser: "internet explorer",
      browser_version: "latest"
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
