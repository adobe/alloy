import { normalizeCustomerIds, validateCustomerIds } from "./util";
import {
  convertBufferToHex,
  convertStringToSha256Buffer,
  clone,
  isEmptyObject
} from "../../../utils";

export default ({ eventManager, consent, logger }) => {
  const hash = (originalIds, normalizedIds) => {
    const idNames = Object.keys(normalizedIds);
    const idsToHash = idNames.filter(idName => originalIds[idName].hashEnabled);
    const idHashPromises = idsToHash.map(id =>
      convertStringToSha256Buffer(normalizedIds[id].id.trim().toLowerCase())
    );
    return Promise.all(idHashPromises).then(hashedIds => {
      return hashedIds.reduce((finalIds, hashedId, index) => {
        if (!hashedId) {
          delete finalIds[idsToHash[index]];
          logger.warn(
            `Unable to hash identity ${idsToHash[index]} due to lack of browser support.`
          );
        } else {
          finalIds[idsToHash[index]].id = convertBufferToHex(hashedId);
        }
        return finalIds;
      }, normalizedIds);
    });
  };

  const state = {
    ids: {},
    hasIds: false
  };
  const setState = normalizedIds => {
    state.ids = {
      ...state.ids,
      ...normalizedIds
    };
    state.hasIds = !!Object.keys(state.ids).length;
  };
  const customerIds = {
    addToPayload(payload) {
      if (state.hasIds) {
        const ids = clone(state.ids);
        Object.keys(ids).forEach(name => {
          payload.addIdentity(name, ids[name]);
        });
      }
    },
    sync(originalIds) {
      validateCustomerIds(originalIds);

      const normalizedIds = normalizeCustomerIds(originalIds);

      return hash(originalIds, normalizedIds).then(hashedIds => {
        if (isEmptyObject(hashedIds)) {
          return false;
        }
        setState(hashedIds);
        const event = eventManager.createEvent();
        return consent.whenConsented().then(() => {
          // FIXME: Konductor shouldn't require an event.
          return eventManager.sendEvent(event);
        });
      });
    }
  };

  return customerIds;
};
