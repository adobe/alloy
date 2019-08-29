import createEvent from "../DataCollector/createEvent";
import addCustomerIdsToPayload from "./addCustomerIdsToPayload";

const makeServerCall = (payload, lifecycle, network) => {
  return lifecycle.onBeforeDataCollection(payload).then(() => {
    return network.sendRequest(payload, payload.expectsResponse);
  });
};

export default (ids, cookieJar, lifecycle, network, optIn) => {
  const event = createEvent(); // FIXME: We shouldn't need an event.
  event.mergeData({}); // FIXME: We shouldn't need an event.
  const payload = network.createPayload();
  payload.addEvent(event); // FIXME: We shouldn't need an event.
  addCustomerIdsToPayload(ids, cookieJar, payload).then(() => {
    return lifecycle
      .onBeforeEvent(event, {}, false) // FIXME: We shouldn't need an event.
      .then(() => optIn.whenOptedIn())
      .then(() => makeServerCall(payload, lifecycle, network));
  });
};
