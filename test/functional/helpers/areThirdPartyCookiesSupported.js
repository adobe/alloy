import { t } from "testcafe";

// The names here match those listed in
// https://github.com/lancedikson/bowser/blob/9ecf3e94c3269ef8bb4c8274dab6a31eea665aea/src/constants.js
// which is the library that provides the value for t.browser.name.
const browsersSupportingThirdPartyCookiesByDefault = [
  "Chrome",
  "Chromium",
  "Microsoft Edge",
  "Internet Explorer"
];

export default () =>
  browsersSupportingThirdPartyCookiesByDefault.indexOf(t.browser.name) !== -1;
