/** @import { Identity } from '../../utils/request/types.js' */

/**
 * @typedef {Object} PushSubscription
 * @property {string} endpoint - The push service endpoint URL
 * @property {Object} keys - The subscription keys object
 * @property {string|null} keys.p256dh - The P-256 ECDH public key as an ArrayBuffer, or null if not available
 * @property {string|null} keys.auth - The authentication secret as an ArrayBuffer, or null if not available
 */

export const Types = {};
