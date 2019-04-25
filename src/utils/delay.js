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

/**
 * Invokes func after wait milliseconds
 *
 * @param {Function} func The function to delay.
 * @param {Number} wait The number of milliseconds to delay invocation
 * @returns {Number} The timer ID
 */
export default function delay(func, wait = 0, win = window) {
  return win.setTimeout(func, Number(wait) || 0);
}

/**
 * Cancels an in progress delayed func
 *
 * @param {Number} The timer ID
 */
export function cancelDelay(id = -1, win = window) {
  win.clearTimeout(id);
}
