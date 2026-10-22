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
 * @property {(() => string)} getId
 * @property {(() => RequestPayload)} getPayload
 * @property {((arg0: {isIdentityEstablished: boolean}) => string)}  getAction
 * @property {(() => string|undefined)} getDatastreamIdOverride
 * @property {Function} getUseSendBeacon
 * @property {(() => boolean)} getUseKeepalive
 * @property {(() => string|undefined)} getEdgeSubPath
 * @property {Function} getUseIdThirdPartyDomain
 * @property {Function} setUseIdThirdPartyDomain
 * @property {Function} setIsIdentityEstablished
 */

/**
 * Request payload object with methods for merging different types of data.
 *
 * @typedef {Object} RequestPayload
 * @property {((arg0: object) => void)} mergeMeta
 * @property {((arg0: object) => void)} mergeState
 * @property {((arg0: object) => void)} mergeQuery
 * @property {((arg0: object) => void)} mergeConfigOverride
 * @property {((arg0: string, arg1: Identity) => void)} options.addIdentity
 * @property {((arg0: string) => boolean)} options.hasIdentity
 * @property {(() => object)} toJSON
 */

/**
 * Request payload object with methods for merging different types of data.
 *
 * @typedef {Object} DataCollectionRequestPayload
 * @property {((arg0: object) => void)} mergeMeta
 * @property {((arg0: object) => void)} mergeState
 * @property {((arg0: object) => void)} mergeQuery
 * @property {((arg0: object) => void)} mergeConfigOverride
 * @property {((arg0: string, arg1: Identity) => void)} options.addIdentity
 * @property {((arg0: string) => boolean)} options.hasIdentity
 * @property {((arg0: object) => void)} addEvent
 * @property {(() => Array)} getEvents
 * @property {(() => boolean)} getDocumentMayUnload
 * @property {(() => object)} toJSON
 */

/**
 * @typedef {Object} Identity
 * @property {string} id
 */

export const Types = {};
