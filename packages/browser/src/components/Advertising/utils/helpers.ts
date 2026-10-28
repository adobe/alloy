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

import {
  SKWCID_PARAM,
  EFID_PARAM,
  UNKNOWN_ADVERTISER,
  LAST_CLICK_COOKIE_KEY,
  LOG_ID_CONVERSION_SUCCESS,
  LAST_CONVERSION_TIME_KEY,
  DISPLAY_CLICK_COOKIE_KEY,
  AD_CONVERSION_VIEW_EVENT_TYPE,
  SURFER_ID,
  HASHED_IP,
  ID5_ID,
  RAMP_ID,
  DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
} from "../constants/index.js";

import type {
  Event as UtilsEvent,
  Logger,
} from "@adobe/alloy-core/utils/types.js";
import type {
  AdvertiserSetting,
  AdvertisingConfig,
  AdvertisingIds,
  CookieManager,
} from "../types.js";
import { queryString } from "@adobe/alloy-core/utils";

const getUrlParams = () => {
  const parsedParams = queryString.parse(window.location.search);
  return {
    skwcid: parsedParams[SKWCID_PARAM], // "s_kwcid"
    efid: parsedParams[EFID_PARAM], // "ef_id"
  };
};

/**
 * Manages a single, ongoing asynchronous operation to prevent redundant calls.
 */
const createManagedAsyncOperation = <A extends unknown[], R>(
  operationName: string,
  workerFn: (...args: A) => Promise<R>,
) => {
  let inProgressPromise: Promise<R> | null = null;

  return (...args: A) => {
    if (inProgressPromise) {
      return inProgressPromise;
    }
    inProgressPromise = workerFn(...args).finally(() => {
      inProgressPromise = null;
    });

    return inProgressPromise;
  };
};

/**
 * Normalizes advertiser settings - extracts enabled advertiser IDs
 */
const normalizeAdvertiser = (
  advertiserSettings: AdvertiserSetting[] | undefined,
): string => {
  if (!advertiserSettings || !Array.isArray(advertiserSettings)) {
    return UNKNOWN_ADVERTISER;
  }

  return advertiserSettings
    .filter((item) => item && item.enabled === true && item.advertiserId)
    .map((item) => item.advertiserId)
    .join(", ");
};

/**
 * Appends AdCloud identity data to the event XDM as _experience.adcloud.stitchId.
 */
const appendAdCloudIdentityToEvent = (
  idsToInclude: AdvertisingIds & { adfId?: string },
  event: Pick<UtilsEvent, "mergeXdm">,
) => {
  const ID_SEPARATOR = "|";
  // Order is a downstream AdCloud contract — consumers parse this string positionally.
  // Do not reorder. adfId is a forward-looking placeholder for a future ID type; always serializes as an empty slot for now.
  const ADCLOUD_ID_ORDER = [SURFER_ID, HASHED_IP, ID5_ID, RAMP_ID, "adfId"];
  const concatenatedId = ADCLOUD_ID_ORDER.map(
    (key) => idsToInclude[key] ?? "",
  ).join(ID_SEPARATOR);

  event.mergeXdm({
    _experience: {
      adcloud: {
        stitchId: concatenatedId,
      },
    },
  });
};

const appendAdvertisingIdQueryToEvent = <
  E extends Pick<UtilsEvent, "mergeQuery">,
>(
  idsToInclude: AdvertisingIds,
  event: E,
  cookieManager: CookieManager,
  componentConfig: AdvertisingConfig,
  addEventType = false,
): E => {
  const searchClickData = cookieManager.getValue<{ click_time?: number }>(
    LAST_CLICK_COOKIE_KEY,
  );
  let displayClickCookie: string | null | undefined = null;
  const displayClickCookieExpires = cookieManager.getValue<number>(
    DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
  );
  if (displayClickCookieExpires && displayClickCookieExpires > Date.now()) {
    displayClickCookie = cookieManager.getValue<string>(
      DISPLAY_CLICK_COOKIE_KEY,
    );
  }
  const query = {
    advertising: {
      ...(searchClickData?.click_time && {
        lastSearchClick: searchClickData.click_time,
      }),
      ...(displayClickCookie && {
        lastDisplayClick: displayClickCookie,
      }),
      stitchIds: {
        ...(idsToInclude[SURFER_ID] && {
          surferId: idsToInclude[SURFER_ID],
        }),
        ...(idsToInclude[ID5_ID] && { id5: idsToInclude[ID5_ID] }),
        ...(idsToInclude[RAMP_ID] && { rampIdEnv: idsToInclude[RAMP_ID] }),
        ...(idsToInclude[HASHED_IP] && {
          hashedIp: idsToInclude[HASHED_IP],
        }),
      },
      advIds: normalizeAdvertiser(componentConfig.advertiserSettings),
      ...(addEventType && { eventType: AD_CONVERSION_VIEW_EVENT_TYPE }),
    },
  };

  event.mergeQuery(query);
  return event;
};

const isAnyIdUnused = (
  availableIds: Record<string, unknown>,
  conversionCalled: Record<string, boolean>,
) => {
  return Object.entries(availableIds).some(([idType]) => {
    return !conversionCalled[idType];
  });
};

const markIdsAsConverted = (
  idTypes: string[],
  conversionCalled: Record<string, boolean>,
  cookieManager: CookieManager,
  logger: Pick<Logger, "info">,
) => {
  const now = Date.now();

  idTypes.forEach((idType) => {
    conversionCalled[idType] = true;
    cookieManager.setValue(`${idType}_last_conversion`, now);
    logger.info(LOG_ID_CONVERSION_SUCCESS.replace("{0}", idType));
  });

  cookieManager.setValue(LAST_CONVERSION_TIME_KEY, now);
};

const isThrottled = (idType: string, cookieManager: CookieManager) => {
  const now = Date.now();
  const THROTTLE_WINDOW = 30 * 60 * 1000; // 30 minutes
  const lastSuccessfulConversion = cookieManager.getValue<number>(
    `${idType}_last_conversion`,
  );
  return Boolean(
    lastSuccessfulConversion &&
    now - lastSuccessfulConversion < THROTTLE_WINDOW,
  );
};

const shouldThrottle = (idType: string, cookieManager: CookieManager) => {
  return isThrottled(idType, cookieManager);
};

export {
  getUrlParams,
  normalizeAdvertiser,
  createManagedAsyncOperation,
  appendAdvertisingIdQueryToEvent,
  appendAdCloudIdentityToEvent,
  isAnyIdUnused,
  markIdsAsConverted,
  isThrottled,
  shouldThrottle,
};
