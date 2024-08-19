/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  CHROME,
  EDGE,
  EDGE_CHROMIUM,
  IE,
  UNKNOWN,
} from "../constants/browser.js";

import lazy from "./lazy.js";

// Users could have also disabled third-party cookies within these browsers, but
// we don't know. We also assume "unknown" browsers support third-party cookies,
// though we don't really know that either. We're making best guesses.
const browsersSupportingThirdPartyCookie = [
  CHROME,
  EDGE,
  EDGE_CHROMIUM,
  IE,
  UNKNOWN,
];

export default ({ getBrowser }) =>
  lazy(() => browsersSupportingThirdPartyCookie.includes(getBrowser()));
