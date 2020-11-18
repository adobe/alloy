const karmaBroserstackLauncher = require("karma-browserstack-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = config => {
  karmaConfig(config);

  const customLaunchers = {
    bs_chrome_windows: {
      base: "BrowserStack",
      browser: "chrome",
      browser_version: "72.0",
      os: "Windows",
      os_version: "10"
    },
    bs_safari_macos: {
      base: "BrowserStack",
      browser: "Safari",
      browser_version: "13.1",
      os: "OS X",
      os_version: "Catalina"
    },
    bs_firefox_windows: {
      base: "BrowserStack",
      browser: "Firefox",
      browser_version: "latest-beta",
      os: "Windows",
      os_version: "10"
    },
    bs_ie_windows: {
      base: "BrowserStack",
      browser: "IE",
      browser_version: "11.0",
      os: "Windows",
      os_version: "10"
    }
  };

  const browserStackAccessKey = process.env.BROWSERSTACK_ACCESS_KEY;

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers,

    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-chrome-launcher",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      "karma-allure-reporter",
      karmaBroserstackLauncher
    ],

    reporters: ["spec", "BrowserStack"],
    browserStack: {
      accessKey: browserStackAccessKey,
      username: process.env.BROWSERSTACK_USERNAME
    }
  });
};
