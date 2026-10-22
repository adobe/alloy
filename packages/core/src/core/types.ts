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
 * @typedef {object} AlloyMonitor
 * @property {((arg0: any) => void)} [onBeforeLog]
 * @property {((arg0: any) => void)} [onInstanceCreated]
 * @property {((arg0: any) => void)} [onInstanceConfigured]
 * @property {((arg0: any) => void)} [onBeforeCommand]
 * @property {((arg0: any) => void)} [onCommandResolved]
 * @property {((arg0: any) => void)} [onCommandRejected]
 * @property {((arg0: any) => void)} [onBeforeNetworkRequest]
 * @property {((arg0: any) => void)} [onNetworkResponse]
 * @property {((arg0: any) => void)} [onNetworkError]
 * @property {((arg0: any) => void)} [onContentHiding]
 * @property {((arg0: any) => void)} [onContentRendering]
 */

/**
 * @typedef {object} Logger
 * @property {boolean} enabled
 * @property {((arg0: any) => void)} logOnInstanceCreated
 * @property {((arg0: any) => void)} logOnInstanceConfigured
 * @property {((arg0: any) => void)} logOnBeforeCommand
 * @property {((arg0: any) => void)} logOnCommandResolved
 * @property {((arg0: any) => void)} logOnCommandRejected
 * @property {((arg0: any) => void)} logOnBeforeNetworkRequest
 * @property {((arg0: any) => void)} logOnNetworkResponse
 * @property {((arg0: any) => void)} logOnNetworkError
 * @property {((arg0: any) => void)} logOnContentHiding
 * @property {((arg0: any) => void)} logOnContentRendering
 * @property {((...args: any[]) => void)} info
 * @property {((...args: any[]) => void)} warn
 * @property {((...args: any[]) => void)} error
 */

/**
 * @typedef {object} Event
 * @property {(() => boolean)} hasQuery
 * @property {(() => object)} getContent
 * @property {((arg0: object) => void)} setUserXdm
 * @property {((arg0: object) => void)} setUserData
 * @property {((arg0: object) => void)} mergeXdm
 * @property {((arg0: object) => void)} mergeData
 * @property {((arg0: object) => void)} mergeMeta
 * @property {((arg0: object) => void)} mergeQuery
 * @property {(() => void)} documentMayUnload
 * @property {((arg0?: function) => void)} finalize
 * @property {(() => boolean)} getDocumentMayUnload
 * @property {(() => boolean)} isEmpty
 * @property {(() => boolean)} shouldSend
 * @property {(() => string|undefined)} getViewName
 * @property {(() => object)} toJSON
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
 * @property {(() => Event)} createEvent
 * @property {((arg0: Event, arg1?: SendEventOptions) => Promise<any>)} sendEvent
 * @property {((arg0: Event, arg1?: ApplyResponseOptions) => Promise<any>)} applyResponse
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
 * @property {((arg0: string) => Array<any>)} getPayloadsByType - Returns matching fragments by type (e.g., "identity:persist")
 * @property {(() => Array<object>)} getErrors - Returns all error objects from the response
 * @property {(() => Array<object>)} getWarnings - Returns all warning objects from the response
 * @property {(() => object)} getEdge - Returns object containing regionId from x-adobe-edge header
 * @property {(() => ResponseContent)} toJSON
 */

/**
 * @typedef {((arg0: {content?: ResponseContent, getHeader: ((arg0: string) => string|undefined)}) => Response)} ResponseCreator
 */

export const Types = {};
