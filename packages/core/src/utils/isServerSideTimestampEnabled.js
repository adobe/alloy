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

export const SERVER_SIDE_TIMESTAMP = "serverSideTimestamp";

/**
 * Whether events sent to Edge Network (`/interact` and `/collect`) should
 * leave `xdm.timestamp` out, so Edge Network stamps them with its own time.
 * Turned on by adding "serverSideTimestamp" to the `context` configuration.
 *
 * Edge Network only fills in a timestamp that is missing; a `null` timestamp
 * is passed downstream as-is.
 *
 * @param {{ context?: unknown }} config
 * @returns {boolean}
 */
export default (config) =>
  Array.isArray(config.context) &&
  config.context.includes(SERVER_SIDE_TIMESTAMP);
