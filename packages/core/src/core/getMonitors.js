/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable dot-notation */

/** @import { AlloyMonitor } from './types.js' */

/**
 * This factory function creates a getter that combines both provided monitors
 * and any monitors found in the global window.__alloyMonitors array.
 *
 * @param {Array<AlloyMonitor>} [monitors] - Optional array of monitor objects to append to the current one
 * @returns {Function} A function that when called, returns all available monitors
 */
export default (monitors) => {
  /** @type {Array<AlloyMonitor>} */
  let alloyMonitors = window["__alloyMonitors"] || [];

  if (monitors) {
    alloyMonitors = alloyMonitors.concat(monitors);
  }

  return alloyMonitors;
};
