/** @import { Logger } from '../../core/types.js' */
/** @import { CookieJar } from '../../utils/types.js' */

/**
 * @typedef {Object} IdentityManager
 * @property {Function} initialize
 * @property {Function} setIdentityAcquired - Marks identity as acquired and resolves any pending identity promises
 * @property {Function} awaitIdentity - Returns a promise that resolves when identity is acquired
 * @property {Function} getEcidFromCookie
 */

export const Types = {};
