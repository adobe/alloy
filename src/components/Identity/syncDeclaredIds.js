import { sha256Buffer, normalizeCustomerIds, bufferToHex } from "./util";
import { crc32 } from "../../utils";
import { COOKIE_NAMES } from "./constants";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

const makeServerCall = (payload, lifecycle, network) => {
  return lifecycle.onBeforeDataCollection(payload).then(() => {
    return network.sendRequest(payload, payload.expectsResponse);
  });
};

export default (
  customerIds,
  event,
  payload,
  cookie,
  lifecycle,
  network,
  optIn
) => {
  const normalizedCustomerIds = normalizeCustomerIds(customerIds);
  const idNames = Object.keys(normalizedCustomerIds);
  const idsToHash = idNames.filter(idName => customerIds[idName].hash);
  const hashedIds = idsToHash.map(id =>
    sha256Buffer(normalizedCustomerIds[id].id)
  );

  Promise.all(hashedIds).then(values => {
    const normalizedAndHashedIds = values.reduce((valueObj, value, index) => {
      valueObj[idsToHash[index]].id = bufferToHex(value);
      return valueObj;
    }, normalizedCustomerIds);

    idNames.forEach(idName => {
      payload.addIdentity(idName, normalizedAndHashedIds[idName]);
    });
    const customerIdsHash = crc32(
      JSON.stringify(normalizedCustomerIds)
    ).toString(36);

    const customerIdChanged = customerIdsHash === cookie.get(CUSTOMER_ID_HASH);
    payload.mergeMeta({ identity: { customerIdChanged } });
    if (!customerIdChanged) {
      cookie.set(CUSTOMER_ID_HASH, customerIdsHash);
    }
    return lifecycle
      .onBeforeEvent(event, {}, false) // FIXME: We shouldn't need an event.
      .then(() => optIn.whenOptedIn())
      .then(() => makeServerCall(payload, lifecycle, network));
  });
};
