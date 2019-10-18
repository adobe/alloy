import { normalizeCustomerIds, validateCustomerIds } from "./util";
import {
  crc32,
  convertBufferToHex,
  convertStringToSha256Buffer,
  clone
} from "../../../utils";
import { COOKIE_NAMES } from "../constants";
import createEvent from "../../DataCollector/createEvent";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

export default (cookieJar, lifecycle, network, optIn) => {
  const updateChecksum = checksum => cookieJar.set(CUSTOMER_ID_HASH, checksum);

  // TODO: FIXME: We shouldn't need an event.
  const createPayload = event => {
    const payload = network.createPayload();
    payload.addEvent(event);
    return payload;
  };

  const hash = (originalIds, normalizedIds) => {
    const idNames = Object.keys(normalizedIds);
    const idsToHash = idNames.filter(idName => originalIds[idName].hash);
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

  const makeServerCall = payload => {
    return lifecycle.onBeforeDataCollection({ payload }).then(() => {
      return network.sendRequest(payload, payload.expectsResponse);
    });
  };

  const state = {
    haveChanged: false,
    ids: {},
    hasIds: false
  };
  const setState = (customerIdChanged, normalizedIds) => {
    state.haveChanged = customerIdChanged;
    state.ids = {
      ...state.ids,
      ...normalizedIds
    };
    state.hasIds = !!Object.keys(state.ids).length;
  };
  const customerIds = {
    addToPayload(payload) {
      const currentState = clone(state);
      if (currentState.hasIds) {
        Object.keys(currentState.ids).forEach(name => {
          payload.addIdentity(name, currentState.ids[name]);
        });
        payload.mergeMeta({
          identity: { customerIdChanged: currentState.haveChanged }
        });
        state.haveChanged = false;
      }
    },
    sync(originalIds) {
      validateCustomerIds(originalIds);

      const normalizedIds = normalizeCustomerIds(originalIds);
      const checksum = crc32(JSON.stringify(normalizedIds)).toString(36);
      const customerIdChanged = checksum !== cookieJar.get(CUSTOMER_ID_HASH);

      const event = createEvent();
      const payload = createPayload(event);

      if (customerIdChanged) {
        updateChecksum(checksum);
      }

      return hash(originalIds, normalizedIds).then(hashedIds => {
        setState(customerIdChanged, hashedIds);
        return lifecycle
          .onBeforeEvent({
            event,
            options: {},
            isViewStart: false
          }) // FIXME: We shouldn't need an event.
          .then(() => optIn.whenOptedIn())
          .then(() => makeServerCall(payload));
      });
    }
  };

  return customerIds;
};
