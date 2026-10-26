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

import type {
  ComponentTools,
  Event,
  Logger,
} from "@adobe/alloy-core/core/types.js";
import type { ConsentManager } from "@adobe/alloy-core/core/consent/types.js";
import type {
  AdvertisingConfig,
  AdvertisingEventOptions,
  AdvertisingIds,
  CookieManager,
  IdentityCollector,
} from "../types.js";
import type * as helpers from "../utils/helpers.js";
import type * as id5 from "../identities/collectID5Id.js";
import type * as rampId from "../identities/collectRampId.js";
import { SURFER_ID, HASHED_IP, ID5_ID, RAMP_ID } from "../constants/index.js";
import { AUTO, WAIT } from "@adobe/alloy-core/constants/consentStatus.js";
import { CHROME } from "@adobe/alloy-core/constants/browser.js";

const isAdvertisingDisabled = (advertising: AdvertisingEventOptions) => {
  const handling = advertising?.handleAdvertisingData?.toLowerCase();
  return !(handling !== undefined && [AUTO, WAIT].includes(handling));
};

const waitForAdvertisingId = (advertising: AdvertisingEventOptions) => {
  return advertising?.handleAdvertisingData?.toLowerCase() === WAIT;
};

/**
 * Creates an onBeforeSendEvent handler that appends advertising IDs to events.
 */
export default ({
  cookieManager,
  logger,
  componentConfig,
  getBrowser,
  consent,
  collectSurferId,
  getID5Id,
  getRampId,
  appendAdvertisingIdQueryToEvent,
  appendAdCloudIdentityToEvent,
  collectHashedIPAddr,
  getUrlParams,
  isThrottled,
  normalizeAdvertiser,
}: {
  cookieManager: CookieManager;
  logger: Logger;
  componentConfig: AdvertisingConfig | undefined;
  getBrowser: ComponentTools["getBrowser"] | undefined;
  consent: ConsentManager;
  /** Factory-created, already bound to cookieManager/getBrowser. */
  collectSurferId: IdentityCollector;
  getID5Id: typeof id5.getID5Id;
  getRampId: typeof rampId.getRampId;
  appendAdvertisingIdQueryToEvent: typeof helpers.appendAdvertisingIdQueryToEvent;
  appendAdCloudIdentityToEvent: typeof helpers.appendAdCloudIdentityToEvent;
  collectHashedIPAddr: () => Promise<string>;
  getUrlParams: typeof helpers.getUrlParams;
  isThrottled: typeof helpers.isThrottled;
  normalizeAdvertiser: typeof helpers.normalizeAdvertiser;
}) => {
  /**
   * Appends advertising identity IDs to AEP event query if not already added.
   */
  return async ({
    event,
    advertising = {},
  }: {
    event: Event;
    advertising?: AdvertisingEventOptions;
  }): Promise<void> => {
    const { state } = consent.current();
    if (state !== "in") {
      return;
    }
    const { skwcid, efid } = getUrlParams();
    const isClickThru = !!(skwcid && efid);
    // Skip identity resolution when no enabled advertiser IDs are configured —
    // there is nothing meaningful to enrich the event with downstream.
    const activeAdvertiserIds = normalizeAdvertiser(
      componentConfig?.advertiserSettings,
    );
    const hasAdvertiserIds = activeAdvertiserIds.length > 0;
    if (
      isAdvertisingDisabled(advertising) ||
      isClickThru ||
      !hasAdvertiserIds ||
      (isThrottled(SURFER_ID, cookieManager) &&
        isThrottled(ID5_ID, cookieManager) &&
        isThrottled(RAMP_ID, cookieManager))
    )
      return;

    // A non-empty advertiser ID list implies the advertising config exists.
    const advertisingConfig = componentConfig!;

    try {
      const useShortTimeout = waitForAdvertisingId(advertising);

      let rampIdPromise: Promise<string | null> | null = null;
      if (!getBrowser || getBrowser() !== CHROME) {
        rampIdPromise = getRampId(
          logger,
          advertisingConfig.rampIdJSPath,
          cookieManager,
          useShortTimeout,
          useShortTimeout,
        );
      }
      const id5Promise = advertisingConfig.id5PartnerId
        ? getID5Id(
            logger,
            advertisingConfig.id5PartnerId,
            useShortTimeout,
            useShortTimeout,
          )
        : Promise.resolve(null);

      const [surferIdResult, hashedIPResult, id5IdResult, rampIdResult] =
        await Promise.allSettled([
          collectSurferId(useShortTimeout),
          collectHashedIPAddr(),
          id5Promise,
          rampIdPromise,
        ]);

      const availableIds: AdvertisingIds = {};
      const availableIdsForIdentity: AdvertisingIds = {};

      if (surferIdResult.status === "fulfilled" && surferIdResult.value) {
        availableIdsForIdentity[SURFER_ID] = surferIdResult.value;
        if (!isThrottled(SURFER_ID, cookieManager)) {
          availableIds[SURFER_ID] = surferIdResult.value;
        }
      }
      if (hashedIPResult.status === "fulfilled" && hashedIPResult.value) {
        availableIdsForIdentity[HASHED_IP] = hashedIPResult.value;
        if (!isThrottled(SURFER_ID, cookieManager)) {
          availableIds[HASHED_IP] = hashedIPResult.value;
        }
      }
      if (
        id5IdResult.status === "fulfilled" &&
        id5IdResult.value &&
        !isThrottled(ID5_ID, cookieManager)
      ) {
        availableIds.id5Id = id5IdResult.value;
      }
      if (
        rampIdResult.status === "fulfilled" &&
        rampIdResult.value &&
        !isThrottled(RAMP_ID, cookieManager)
      ) {
        availableIds.rampId = rampIdResult.value;
      }

      if (Object.keys(availableIdsForIdentity).length !== 0) {
        appendAdCloudIdentityToEvent(availableIdsForIdentity, event);
      }

      // If no IDs are available and any ID is throttled, skip — no new info to send
      if (
        Object.keys(availableIds).length === 0 &&
        (isThrottled(SURFER_ID, cookieManager) ||
          isThrottled(ID5_ID, cookieManager) ||
          isThrottled(RAMP_ID, cookieManager))
      ) {
        return;
      }

      appendAdvertisingIdQueryToEvent(
        availableIds,
        event,
        cookieManager,
        advertisingConfig,
      );
    } catch (error) {
      logger.error("Error in onBeforeSendEvent hook:", error);
    }
  };
};
