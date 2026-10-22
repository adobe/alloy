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

export interface Storage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => boolean;
  clear: () => boolean;
}

export interface CookieAttributes {
  /** Cookie expiration (number of days or Date object) */
  expires?: number | Date;
  /** Cookie path (default: "/") */
  path?: string;
  /** Cookie domain */
  domain?: string;
  /** Requires HTTPS transmission */
  secure?: boolean;
  /** SameSite attribute */
  sameSite?: "strict" | "lax" | "none";
}

export interface CookieConverter {
  /** Custom decoder function */
  read?: (value: string, name: string) => string;
  /** Custom encoder function */
  write?: (value: string, name: string) => string;
}

export interface CookieJar {
  /** Get cookie value by name */
  get(name: string): string | undefined;
  /** Get all cookies as key-value object when called with no arguments */
  get(): Record<string, string>;
  /** Set cookie with optional attributes */
  set(
    name: string,
    value: string,
    attributes?: CookieAttributes,
  ): string | undefined;
  /** Remove cookie with optional attributes (must match set attributes) */
  remove(name: string, attributes?: CookieAttributes): void;
  /** Create new instance with custom encoding/decoding */
  withConverter(converter: CookieConverter): CookieJar;
}

export type StorageCreator = (additionalNamespace: string) => {
  session: Storage;
  persistent: Storage;
};

/** A function registered by a caller to be invoked later with `A`. */
export type Callback<A extends unknown[] = unknown[], R = unknown> = (
  ...args: A
) => R;

/** The subset of the core logger used by utils. */
export interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
}

/** The subset of the core event used by utils. */
export interface Event {
  mergeXdm: (xdm: object) => void;
  mergeQuery: (query: object) => void;
  documentMayUnload: () => void;
}

export const Types = {};

declare const nonNaN: unique symbol;
/** Brand for numbers known not to be NaN (see isNumber). Type-only. */
export interface NonNaN {
  readonly [nonNaN]: true;
}

declare const nonEmpty: unique symbol;
/** Brand for strings known to be non-empty (see isNonEmptyString). Type-only. */
export interface NonEmpty {
  readonly [nonEmpty]: true;
}
