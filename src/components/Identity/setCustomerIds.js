import createEvent from "../DataCollector/createEvent";
import { validateCustomerIds } from "./util";
import processCustomerIds from "./processCustomerIds";
import { assign } from "../../utils";

const makeServerCall = (payload, processedIds, lifecycle, network) => {
  return lifecycle.onBeforeDataCollection(payload, processedIds).then(() => {
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
  if (customerIdChanged) {
    customerIdsProcess.updateChecksum(cookieJar);
  }
  return customerIdsProcess
    .getNormalizedAndHashedIds()
    .then(normalizedAndHashedIds => {
      lifecycle
        .onBeforeEvent(event, {}, false) // FIXME: We shouldn't need an event.
        .then(() => optIn.whenOptedIn())
        .then(() =>
          makeServerCall(
            payload,
            { normalizedAndHashedIds, customerIdChanged },
            lifecycle,
            network
          )
        );
    });
};
