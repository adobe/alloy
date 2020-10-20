import { t } from "testcafe";
import {
  CHROME,
  CHROMIUM,
  EDGE,
  INTERNET_EXPLORER
} from "./constants/browsers";

const browsersSupportingThirdPartyCookiesByDefault = [
  CHROME,
  CHROMIUM,
  EDGE,
  INTERNET_EXPLORER
];

// This must be a function called during the test, otherwise TestCafe will throw
// an error about how it can't resolve the right context for "t".
export default () =>
  browsersSupportingThirdPartyCookiesByDefault.indexOf(t.browser.name) !== -1;
