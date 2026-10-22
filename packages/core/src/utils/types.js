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
 * @property {((arg0: string) => string|null)} getItem
 * @property {((arg0: string, arg1: string) => void)} setItem
 * @property {(() => void)} clear
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
 * @property {((arg0: string, arg1: string) => string)} [read] - Custom decoder function
 * @property {((arg0: string, arg1: string) => string)} [write] - Custom encoder function
 */

/**
 * @typedef {Object} CookieJar
 * @property {((arg0: string) => string|undefined)} get - Get cookie value by name, or get all cookies as object if no name provided
 * @property {(() => Object<string, string>)} get - Get all cookies as key-value object when called with no arguments
 * @property {((arg0: string, arg1: string, arg2?: CookieAttributes) => string|undefined)} set - Set cookie with optional attributes
 * @property {((arg0: string, arg1?: CookieAttributes) => void)} remove - Remove cookie with optional attributes (must match set attributes)
 * @property {((arg0: CookieConverter) => CookieJar)} withConverter - Create new instance with custom encoding/decoding
 */

/**
 * @typedef {((arg0: string) => { session: Storage, persistent: Storage })} StorageCreator
 */

export const Types = {};
