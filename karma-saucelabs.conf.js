const karmaSauceLauncher = require("karma-sauce-launcher");

const karmaConfig = require("./karma.conf.js");

module.exports = function(config) {
  karmaConfig(config);

  const launchers = {
    sl_chrome: {
      base: "SauceLabs",
      browserName: "chrome"
    }
    // Specify supported browsers here
    // sl_chrome_57: {
    // 	base: 'SauceLabs',
    // 	browserName: 'chrome',
    // 	version: '57'
    // },
    // sl_safari_9: {
    // 	base: 'SauceLabs',
    // 	browserName: 'safari',
    // 	version: '9'
    // },
    // sl_safari_10: {
    // 	base: 'SauceLabs',
    // 	browserName: 'safari',
    // 	version: '10'
    // },
    // sl_firefox: {
    // 	base: 'SauceLabs',
    // 	browserName: 'firefox'
    // },
    // sl_firefox_53: {
    // 	base: 'SauceLabs',
    // 	browserName: 'firefox',
    // 	version: '53'
    // },
    // sl_ie_10: {
    // 	base: 'SauceLabs',
    // 	browserName: 'internet explorer',
    // 	platform: 'Windows 7',
    // 	version: '10'
    // },
    // sl_ie_11: {
    // 	base: 'SauceLabs',
    // 	browserName: 'internet explorer',
    // 	platform: 'Windows 8.1',
    // 	version: '11'
    // },
    // sl_edge_20: {
    // 	base: 'SauceLabs',
    // 	browserName: 'microsoftedge',
    // 	platform: 'Windows 10',
    // 	version: '13'
    // },
    // sl_iphone: {
    // 	base: 'SauceLabs',
    // 	browserName: 'iphone',
    // 	platform: 'OS X 10.10',
    // 	version: '9.2'
    // },
    // sl_android_4: {
    // 	base: 'SauceLabs',
    // 	browserName: 'android',
    // 	platform: 'Linux',
    // 	version: '4.4'
    // },
    // sl_android_5: {
    // 	base: 'SauceLabs',
    // 	browserName: 'android',
    // 	platform: 'Linux',
    // 	version: '5.0'
    // }
  };

  config.set({
    browsers: Object.keys(launchers),

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 240000,

    captureTimeout: 240000,

    customLaunchers: launchers,

    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-chrome-launcher",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      karmaSauceLauncher
    ],

    reporters: ["spec", "saucelabs"],

    sauceLabs: {
      accessKey: process.env.SAUCE_ACCESS_KEY,
      connectOptions: {
        port: 4445,
        logfile: "sauce_connect.log"
      },
      recordScreenshots: true,
      recordVideo: false,
      startConnect: true,
      testName: "alloy tests",
      username: process.env.SAUCE_USERNAME
    }
  });
};
