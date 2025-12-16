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
