import { normalizeCustomerIds, validateCustomerIds } from "./util";
import {
  convertBufferToHex,
  convertStringToSha256Buffer,
  clone
} from "../../../utils";

export default eventManager => {
  const hash = (originalIds, normalizedIds) => {
    const idNames = Object.keys(normalizedIds);
    const idsToHash = idNames.filter(idName => originalIds[idName].hashEnabled);
    const idHashPromises = idsToHash.map(id =>
      convertStringToSha256Buffer(normalizedIds[id].id)
    );
    return Promise.all(idHashPromises).then(hashedIds => {
      return hashedIds.reduce((finalIds, hashedId, index) => {
        finalIds[idsToHash[index]].id = convertBufferToHex(hashedId);
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
        setState(hashedIds);
        // FIXME: Konductor shouldn't require an event.
        const event = eventManager.createEvent();
        return eventManager.sendEvent(event);
      });
    }
  };

  return customerIds;
};
