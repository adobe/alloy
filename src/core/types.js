/**
 * @typedef {object} AlloyMonitor
 * @property {function(any): void} [onBeforeLog]
 * @property {function(any): void} [onInstanceCreated]
 * @property {function(any): void} [onInstanceConfigured]
 * @property {function(any): void} [onBeforeCommand]
 * @property {function(any): void} [onCommandResolved]
 * @property {function(any): void} [onCommandRejected]
 * @property {function(any): void} [onBeforeNetworkRequest]
 * @property {function(any): void} [onNetworkResponse]
 * @property {function(any): void} [onNetworkError]
 * @property {function(any): void} [onContentHiding]
 * @property {function(any): void} [onContentRendering]
 */

/**
 * @typedef {object} Logger
 * @property {boolean} enabled
 * @property {function(any): void} logOnInstanceCreated
 * @property {function(any): void} logOnInstanceConfigured
 * @property {function(any): void} logOnBeforeCommand
 * @property {function(any): void} logOnCommandResolved
 * @property {function(any): void} logOnCommandRejected
 * @property {function(any): void} logOnBeforeNetworkRequest
 * @property {function(any): void} logOnNetworkResponse
 * @property {function(any): void} logOnNetworkError
 * @property {function(any): void} logOnContentHiding
 * @property {function(any): void} logOnContentRendering
 * @property {function(...any): void} info
 * @property {function(...any): void} warn
 * @property {function(...any): void} error
 */

/**
 * @typedef {object} Event
 * @property {function(): boolean} hasQuery
 * @property {function(): object} getContent
 * @property {function(object): void} setUserXdm
 * @property {function(object): void} setUserData
 * @property {function(object): void} mergeXdm
 * @property {function(object): void} mergeData
 * @property {function(object): void} mergeMeta
 * @property {function(object): void} mergeQuery
 * @property {function(): void} documentMayUnload
 * @property {function(function=): void} finalize
 * @property {function(): boolean} getDocumentMayUnload
 * @property {function(): boolean} isEmpty
 * @property {function(): boolean} shouldSend
 * @property {function(): string|undefined} getViewName
 * @property {function(): object} toJSON
 */

/**
 * @typedef {object} SendEventOptions
 * @property {object} [edgeConfigOverrides]
configuration
 * @property {boolean} [renderDecisions]
 * @property {string[]} [decisionScopes]
 * @property {object} [decisionContext]
 * @property {object} [personalization]
 * @property {object} [mediaOptions]
 */

/**
 * @typedef {object} ApplyResponseOptions
 * @property {boolean} [renderDecisions=false]
 * @property {object} [decisionContext={}]
 * @property {object} [responseHeaders={}]
 * @property {object} [responseBody={handle:[]}]
 * @property {object} [personalization]
 */

/**
 * @typedef {object} EventManager
 * @property {function(): Event} createEvent
 * @property {function(Event, SendEventOptions=): Promise<any>} sendEvent
 * @property {function(Event, ApplyResponseOptions=): Promise<any>} applyResponse
 */

/**
 * @typedef {Object} ResponseContent
 * @property {Array<{type: string, payload: Array<Object>}>} [handle] - Array of response fragments with type and payload
 * @property {Array<object>} [errors] - Array of error objects
 * @property {Array<object>} [warnings] - Array of warning objects
 */

/**
 * @typedef {Object} ResponseFragment
 * @property {string} type - Fragment type in format "<namespace:action>"
 * @property {any} payload - Fragment payload data
 */

/**
 * @typedef {Object} Response
 * @property {function(string): Array<any>} getPayloadsByType - Returns matching fragments by type (e.g., "identity:persist")
 * @property {function(): Array<object>} getErrors - Returns all error objects from the response
 * @property {function(): Array<object>} getWarnings - Returns all warning objects from the response
 * @property {function(): object} getEdge - Returns object containing regionId from x-adobe-edge header
 * @property {function(): ResponseContent} toJSON
 */

/**
 * @typedef {function({content?: ResponseContent, getHeader: function(string): string|undefined}): Response} ResponseCreator
 */

export const Types = {};
