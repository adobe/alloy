/**
 * @typedef {Object} Storage
 * @property {function(string): string|null} getItem
 * @property {function(string, string): void} setItem
 * @property {function(): void} clear
 */

/**
 * @typedef {Object} CookieAttributes
 * @property {number|Date} [expires] - Cookie expiration (number of days or Date object)
 * @property {string} [path] - Cookie path (default: "/")
 * @property {string} [domain] - Cookie domain
 * @property {boolean} [secure] - Requires HTTPS transmission
 * @property {"strict"|"lax"|"none"} [sameSite] - SameSite attribute
 */

/**
 * @typedef {Object} CookieConverter
 * @property {function(string, string): string} [read] - Custom decoder function
 * @property {function(string, string): string} [write] - Custom encoder function
 */

/**
 * @typedef {Object} CookieJar
 * @property {function(string): string|undefined} get - Get cookie value by name, or get all cookies as object if no name provided
 * @property {function(): Object<string, string>} get - Get all cookies as key-value object when called with no arguments
 * @property {function(string, string, CookieAttributes=): string|undefined} set - Set cookie with optional attributes
 * @property {function(string, CookieAttributes=): void} remove - Remove cookie with optional attributes (must match set attributes)
 * @property {function(CookieConverter): CookieJar} withConverter - Create new instance with custom encoding/decoding
 */

/**
 * @typedef {function(string): { session: Storage, persistent: Storage }} StorageCreator
 */

export const Types = {};
