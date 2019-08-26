import { assign } from "../../utils";
import createEvent from "../DataCollector/createEvent";
import { validateCustomerIds } from "./util";
import processCustomerIds from "./processCustomerIds";

const makeServerCall = (payload, lifecycle, network) => {
  return lifecycle.onBeforeDataCollection(payload).then(() => {
    return network.sendRequest(payload, payload.expectsResponse);
  });
};

export default (ids, cookieJar, lifecycle, network, optIn) => {
  validateCustomerIds(ids);
  const event = createEvent(); // FIXME: We shouldn't need an event.
  event.mergeData({}); // FIXME: We shouldn't need an event.
  const payload = network.createPayload();
  payload.addEvent(event); // FIXME: We shouldn't need an event.
  const customerIds = assign({}, ids);
  const customerIdsProcess = processCustomerIds(customerIds);
  const customerIdChanged = customerIdsProcess.detectCustomerIdChange(
    cookieJar
  );
  customerIdsProcess
    .getNormalizedAndHashedIds()
    .then(normalizedAndHashedIds => {
      const idNames = Object.keys(normalizedAndHashedIds);
      idNames.forEach(idName => {
        payload.addIdentity(idName, normalizedAndHashedIds[idName]);
      });
      payload.mergeMeta({ identity: { customerIdChanged } });
      if (customerIdChanged) {
        customerIdsProcess.updateCheckSum(cookieJar);
      }
      return lifecycle
        .onBeforeEvent(event, {}, false) // FIXME: We shouldn't need an event.
        .then(() => optIn.whenOptedIn())
        .then(() => makeServerCall(payload, lifecycle, network));
    });
};
