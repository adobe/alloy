/** @import { Logger } from '../../core/types.js' */

/**
 * @typedef {Object} ConsentStateMachineUtils
 * @property {Logger} logger
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
 * @typedef {Object} ConsentManagerUtils
 * @property {ConsentStateMachine} generalConsentState
 * @property {Logger} logger
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
