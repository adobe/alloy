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
