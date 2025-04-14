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
