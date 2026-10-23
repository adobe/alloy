/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import injectTimestamp from "./injectTimestamp.js";
import isServerSideTimestampEnabled from "./isServerSideTimestampEnabled.js";
import noop from "./noop.js";

/**
 * Creates the function that sets `xdm.timestamp` on an event bound for Edge
 * Network (`/interact` or `/collect`). It sets the client time, unless the
 * serverSideTimestamp context option is on: then it leaves the timestamp
 * out, and Edge Network stamps the event when it arrives.
 *
 * @param {{ context?: unknown }} config
 * @param {() => Date} dateProvider
 * @returns {(event: { mergeXdm: (xdm: object) => void }) => void}
 */
export default (config, dateProvider) =>
  isServerSideTimestampEnabled(config) ? noop : injectTimestamp(dateProvider);
