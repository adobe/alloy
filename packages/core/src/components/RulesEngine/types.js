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
 * @typedef {Record<string, EventRecord>} EventRegistry
 */

/**
 * @typedef {object} EventPayload
 * @property {string} operation
 * @property {EventData} event
 */

/**
 * @typedef {Record<string, string>} EventData
 * @property {string} eventType
 * @property {string} eventId
 * @property {string} [action]
 */

/**
 * @typedef {object} EventRecord
 * @property {Array<number>} timestamps
 */

/**
 * @typedef {Array<Proposition>} PropositionList
 */

/**
 * @typedef {Object} Proposition
 * @property {string} id
 * @property {string} scope
 * @property {ScopeDetails} scopeDetails
 * @property {Array<PropositionItem>} items
 */

/**
 * @typedef {Object} ScopeDetails
 * @property {string} decisionProvider
 * @property {string} correlationID
 * @property {Characteristics} characteristics
 * @property {number} rank
 * @property {Activity} activity
 */

/**
 * @typedef {Object} Characteristics
 * @property {string} eventToken
 */

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {number} priority
 * @property {Array<string>} matchedSurfaces
 */

/**
 * @typedef {Object} PropositionItem
 * @property {string} schema
 * @property {EventHistoryOperationData|Object} data
 * @property {string} id
 */

/**
 * @typedef {Object} EventHistoryOperationData
 * @property {string} operation
 * @property {RulesEventPayload} content
 * @property {number} qualifiedDate
 */

/**
 * @typedef {Record<string, string>} RulesEventPayload
 * @property {string} iam.eventType
 * @property {string} iam.id
 */

export const Types = {};
