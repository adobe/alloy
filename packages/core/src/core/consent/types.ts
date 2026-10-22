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
 * @property {((arg0: string) => void)} in
 * @property {((arg0: string) => void)} out
 * @property {((arg0: string) => void)} pending
 * @property {((arg0?: boolean) => Promise<void>)} awaitConsent
 * @property {(() => Promise<void>)} withConsent
 * @property {(() => {state: string, wasSet: boolean})} current
 */

/**
 * @typedef {Object} ConsentManager
 * @property {((arg0: Object, arg1: Object) => void)} initializeConsent
 * @property {((arg0: Object) => void)} setConsent
 * @property {(() => void)} suspend
 * @property {(() => Promise<void>)} awaitConsent
 * @property {(() => Promise<void>)} withConsent
 * @property {(() => {state: string, wasSet: boolean})} current
 */

export const Types = {};
