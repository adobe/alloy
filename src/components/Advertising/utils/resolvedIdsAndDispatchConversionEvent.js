import { getSurferId } from "./getAdvertisingIdentity.js";
import { getID5Id } from "../identities/fetchID5Id.js";
import { getRampId } from "../identities/fetchRampId.js";
import fetchAllIds from "../identities/fetchAllIds.js";

export const resolvedIdsAndDispatchConversionEvent = async ({
  eventManager,
  sessionManager,
  logger,
  componentConfig,
  adConversionHandler,
  isDisplay,
}) => {
  const invocationConfig = {
    id5PartnerId: componentConfig.id5PartnerId,
    rampIdScriptPath: componentConfig.liverampScriptPath,
    logger,
  };

  const sendEvent = async (triggerIdType) => {
    const evCcData = sessionManager.readClickData();
    const xdm = {
      eventType: "advertising.conversion",
      data: {
        conversionType: "vt",
        dspAdvertiserID: componentConfig.dspAdvertiserID || "1111111",
        amoAdvertiserID: componentConfig.amoAdvertiserID || "2222222",
        ...(evCcData?.click_time && { clickTime: evCcData.click_time }),
      },
    };

    const surferId = getSurferId(sessionManager, false);
    const id5Id = getID5Id(componentConfig.id5PartnerId, sessionManager, false);
    const rampId = getRampId(sessionManager, false);

    const availableIds = {};
    if (surferId) {
      xdm.data.gSurferId = surferId;
      availableIds.surferId = surferId;
    }
    if (id5Id) {
      xdm.data.id5_id = id5Id;
      availableIds.id5Id = id5Id;
    }
    if (rampId) {
      xdm.data.rampIDEnv = rampId;
      availableIds.rampId = rampId;
    }

    const event = eventManager.createEvent();
    event.setUserXdm(xdm);

    if (isDisplay) {
      sessionManager.setValue("lastConversionTime", Date.now());
      logger.info(
        "lastConversionTime updated for display view-through operation.",
      );
    }

    logger.info(
      `Ad conversion event triggered (${triggerIdType}). IDs:`,
      Object.keys(availableIds),
    );
    return adConversionHandler.trackAdConversion({ event });
  };

  const idPromisesMap = await fetchAllIds(sessionManager, invocationConfig);
  logger.info("ID resolution promises started:", Object.keys(idPromisesMap));

  const results = [];

  Object.entries(idPromisesMap).forEach(([idType, promise]) => {
    promise
      .then((value) => {
        // todo: this check  hasSurferIdChanged() guarantees if surfer_id is changed from cookie, and control if conversion event is fired or not , but this creates problem with multiple alloy instances , this can be buggy
        if (value) {
          results.push(sendEvent(idType));
        }
      })
      .catch((e) => {
        logger.warn(`${idType} resolution failed:`, e.message);
      });
  });

  return results;
};
