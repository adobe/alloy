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
 * @typedef {Object} ConsentStateMachine
 * @property {function(string): void} in
 * @property {function(string): void} out
 * @property {function(string): void} pending
 * @property {function(boolean=): Promise<void>} awaitConsent
 * @property {function(): Promise<void>} withConsent
 * @property {function(): {state: string, wasSet: boolean}} current
 */

/**
 * @typedef {Object} ConsentManager
 * @property {function(Object, Object): void} initializeConsent
 * @property {function(Object): void} setConsent
 * @property {function(): void} suspend
 * @property {function(): Promise<void>} awaitConsent
 * @property {function(): Promise<void>} withConsent
 * @property {function(): {state: string, wasSet: boolean}} current
 */

export const Types = {};
