/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import type { Event } from "@adobe/alloy-core/core/types.js";

export interface AdvertiserSetting {
  advertiserId: string;
  enabled: boolean;
}

/** The computed `advertising` option, added by `configValidators`. */
export interface AdvertisingConfig {
  enabled?: boolean;
  id5PartnerId?: string;
  rampIdJSPath?: string;
  dspEnabled?: boolean;
  advertiserSettings?: AdvertiserSetting[];
}

/** The `advertising` option of `sendEvent`. */
export interface AdvertisingEventOptions {
  handleAdvertisingData?: string;
}

/** The event methods the ad conversion handlers use. */
export type ConversionEvent = Event;

/** Identity values keyed by identity type (surferId, hashedIp, id5Id, rampId). */
export type AdvertisingIds = Partial<Record<string, string>>;

/** Resolves to the identity value, or null when it is not available. */
export type IdentityCollector = (
  resolveIfNotAvailable?: boolean,
) => Promise<string | null>;

export interface AdConversionHandler {
  trackAdConversion: (options: {
    event: ConversionEvent;
  }) => Promise<{ success: boolean }>;
}

export interface CookieManager {
  /** The stored value's type depends on the key, so callers pick it. */
  getValue: <T = unknown>(key: string) => T | undefined;
  setValue: (
    key: string,
    value?: unknown,
    options?: Record<string, unknown>,
  ) => boolean;
}

export interface AdvertisingIdentityResult {
  surferId: string | null;
  displayClickCookie: string | null;
  clientIp: string;
}

/** The ID5 script's global API; the parts used here. */
export interface ID5Status {
  getUserId: () => string | null | undefined;
  onAvailable: (
    callback: (status: ID5Status) => void,
    timeoutMs?: number,
  ) => void;
}

export interface ID5Api {
  init: (options: { partnerId: number }) => ID5Status;
}

/** The LiveRamp ATS script's global API; the parts used here. */
export interface AtsApi {
  retrieveEnvelope: () => Promise<string>;
}
