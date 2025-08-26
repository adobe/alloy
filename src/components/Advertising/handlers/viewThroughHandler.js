/*
Copyright 2025 Adobe. All rights reserved.
Licensed under the Apache License, Version 2.0.
http://www.apache.org/licenses/LICENSE-2.0
*/

import collectAllIdentities from "../identities/collectAllIdentities.js";
import {
  LOG_ERROR_RESOLVING_ID,
  LOG_AD_CONVERSION_FAILED,
  AD_CONVERSION_VIEW_EVENT_TYPE,
} from "../constants/index.js";
import {
  isAnyIdUnused,
  appendAdvertisingIdQueryToEvent,
  markIdsAsConverted,
} from "../utils/helpers.js";

export default async function handleViewThrough({
  eventManager,
  cookieManager,
  logger,
  componentConfig,
  adConversionHandler,
  getBrowser,
}) {
  const resolvedIds = {};
  const usedIdTracker = {};
  const triggerConversion = async () => {
    if (!isAnyIdUnused(resolvedIds, usedIdTracker)) return null;

    const idTypesToUse = Object.keys(resolvedIds);

    try {
      const event = appendAdvertisingIdQueryToEvent(
        resolvedIds,
        eventManager.createEvent(),
        cookieManager,
        componentConfig,
        true,
      );
      const xdm = {
        eventType: AD_CONVERSION_VIEW_EVENT_TYPE,
        timestamp: Date.now().toISOString(),
      };
      event.setUserXdm(xdm);

      const result = await adConversionHandler.trackAdConversion({ event });

      markIdsAsConverted(idTypesToUse, usedIdTracker, cookieManager, logger);
      return result;
    } catch (error) {
      logger.error(LOG_AD_CONVERSION_FAILED, error);
      return null;
    }
  };

  const identityPromisesMap = collectAllIdentities(
    logger,
    componentConfig,
    cookieManager,
    getBrowser,
  );

  if (Object.keys(identityPromisesMap).length === 0) {
    return [];
  }

  const identityPromises = Object.entries(identityPromisesMap).map(
    ([idType, idPromise]) =>
      idPromise
        .then((idValue) => {
          if (idValue) {
            resolvedIds[idType] = idValue;
            return triggerConversion();
          }
        })
        .catch((error) => {
          logger.error(LOG_ERROR_RESOLVING_ID.replace("{0}", idType), error);
          return null;
        }),
  );
  return Promise.allSettled(identityPromises);
}
