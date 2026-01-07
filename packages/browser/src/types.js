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

/**
 * @typedef {object} AlloyQueueItem
 * @property {Function} resolve
 * @property {Function} reject
 * @property {any} userProvidedArgs
 */

/**
 * @typedef {Function & { q: AlloyQueueItem[] }} AlloyInstance
 * A function that executes Alloy commands and returns a Promise,
 * with a queue property for pre-initialization commands.
 * @param {string} commandName
 * @param {Object} [options]
 * @returns {Promise<any>}
 */

/**
 * Window object extended with Alloy namespace and dynamic instance properties
 * @typedef {Window & {
 *   __alloyNS?: string[],
 *   [key: string]: AlloyInstance | any
 * }} WindowWithAlloy
 */

export const Types = {};
