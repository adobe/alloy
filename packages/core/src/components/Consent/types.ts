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

import type {
  Identity,
  Override,
  RequestPayload,
} from "../../utils/request/types.js";

/** One consent object of a `setConsent` call, e.g. `{ standard, version, value }`. */
export interface ConsentObject {
  standard?: unknown;
  version?: unknown;
  [key: string]: unknown;
}

/** Consent values keyed by purpose, e.g. `{ general: "in" }`. */
export type ConsentByPurpose = Record<string, string>;

/** Identities keyed by namespace code. */
export type IdentityMap = Record<string, Identity[]>;

/** The validated options of the `setConsent` command. */
export interface SetConsentOptions {
  consent: ConsentObject[];
  identityMap?: IdentityMap;
  edgeConfigOverrides?: Override;
}

/**
 * Request payload object with methods for merging different types of data.
 */
export interface ConsentRequestPayload extends RequestPayload {
  setConsent: (consent: ConsentObject[]) => void;
}

export const Types = {};
