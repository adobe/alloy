import { RequestLogger, t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};

const destinationLogger = RequestLogger(
  "https://cataas.com/cat",
  networkLoggerConfig
);

const onBeforeEventSend = ClientFunction(() => {
  window.onBeforeEventSendCalled = true;
});

const onBeforeEventSendFailed = ClientFunction(() => {
  window.onBeforeEventSendCalled = true;
  throw new Error("Expected Error");
});

const onBeforeEventSendFalse = ClientFunction(() => {
  window.onBeforeEventSendCalled = true;
  return false;
});

const getOnBeforeEventSendCalled = ClientFunction(() => {
  return window.onBeforeEventSendCalled === true;
});

const getSendEventPromiseResult = ClientFunction(() => {
  return window.sendEventPromiseResult;
});

createFixture({
  title:
    "C1715149 sendEvent should call onBeforeEventSend callback and send when expected",
  requestHooks: [networkLogger.edgeEndpointLogs, destinationLogger]
});

test.meta({
  ID: "C1715149",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window
    .alloy("sendEvent")
    .then(result => {
      window.sendEventPromiseResult = result;
    })
    .catch(() => {
      window.sendEventPromiseResult = { rejected: true };
    });
});

test("C1715149 Events should call onBeforeEventSend callback and still send event", async () => {
  await configureAlloyInstance("alloy", {
    ...orgMainConfigMain,
    onBeforeEventSend
  });

  await triggerAlloyEvent();

  await t.expect(getOnBeforeEventSendCalled()).eql(true);
  await t.expect(destinationLogger.requests.length > 0).eql(true);
});

test("C1715149 Events should call onBeforeEventSend callback, fail, and not send event", async () => {
  await configureAlloyInstance("alloy", {
    ...orgMainConfigMain,
    onBeforeEventSend: onBeforeEventSendFailed
  });

  await triggerAlloyEvent();

  await t.expect(getOnBeforeEventSendCalled()).eql(true);
  await t.expect(getSendEventPromiseResult()).eql({ rejected: true });
  await t.expect(destinationLogger.requests.length).eql(0);
});

test("C1715149 Events should call onBeforeEventSend callback, return false, and not send event", async () => {
  await configureAlloyInstance("alloy", {
    ...orgMainConfigMain,
    onBeforeEventSend: onBeforeEventSendFalse
  });

  await triggerAlloyEvent();

  await t.expect(getOnBeforeEventSendCalled()).eql(true);

  // if event is cancelled, the promise should resolve with an empty object
  await t.expect(getSendEventPromiseResult()).eql({});
  await t.expect(destinationLogger.requests.length).eql(0);
});
