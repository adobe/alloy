const karmaBrowserStackLauncher = require("karma-browserstack-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = config => {
  karmaConfig(config);

  const customLaunchers = {
    bs_chrome_windows: {
      base: "BrowserStack",
      browser: "chrome",
      browser_version: "latest",
      os: "OS X",
      os_version: "Catalina"
    },
    bs_safari_macos: {
      base: "BrowserStack",
      browser: "Safari",
      browser_version: "latest",
      os: "OS X",
      os_version: "Big Sur"
    },
    bs_firefox_windows: {
      base: "BrowserStack",
      browser: "Firefox",
      browser_version: "latest",
      os: "Windows",
      os_version: "10"
    },
    bs_ie_windows: {
      base: "BrowserStack",
      browser: "IE",
      browser_version: "latest",
      os: "Windows",
      os_version: "10"
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
      "karma-allure-reporter",
      karmaBrowserStackLauncher
    ],

    reporters: ["spec", "BrowserStack"]
  });
};
