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
 * Request object with methods to access and modify request properties.
 *
 * @typedef {Object} Request
 * @property {function(): string} getId
 * @property {function(): RequestPayload} getPayload
 * @property {function({isIdentityEstablished: boolean}): string}  getAction
 * @property {function(): string|undefined} getDatastreamIdOverride
 * @property {Function} getUseSendBeacon
 * @property {function(): string|undefined} getEdgeSubPath
 * @property {Function} getUseIdThirdPartyDomain
 * @property {Function} setUseIdThirdPartyDomain
 * @property {Function} setIsIdentityEstablished
 */

/**
 * Request payload object with methods for merging different types of data.
 *
 * @typedef {Object} RequestPayload
 * @property {function(object): void} mergeMeta
 * @property {function(object): void} mergeState
 * @property {function(object): void} mergeQuery
 * @property {function(object): void} mergeConfigOverride
 * @property {function(string, Identity): void} options.addIdentity
 * @property {function(string): boolean} options.hasIdentity
 * @property {function(): object} toJSON
 */

/**
 * Request payload object with methods for merging different types of data.
 *
 * @typedef {Object} DataCollectionRequestPayload
 * @property {function(object): void} mergeMeta
 * @property {function(object): void} mergeState
 * @property {function(object): void} mergeQuery
 * @property {function(object): void} mergeConfigOverride
 * @property {function(string, Identity): void} options.addIdentity
 * @property {function(string): boolean} options.hasIdentity
 * @property {function(object): void} addEvent
 * @property {function(): boolean} getDocumentMayUnload
 * @property {function(): object} toJSON
 */

/**
 * @typedef {Object} Identity
 * @property {string} id
 */

export const Types = {};
