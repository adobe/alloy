import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../../helpers/constants/configParts";

const { CONSENT_IN } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C451771: XDM and data objects should be cloned as soon as feasible.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C451771",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const sendEvent = ClientFunction(() => {
  window.dataLayer = {
    foo: "bar"
  };
  window.alloy("sendEvent", {
    xdm: window.dataLayer
  });
});

const modifyDataLayer = ClientFunction(() => {
  window.dataLayer.foo = "baz";
});

const consentIn = ClientFunction(
  () => {
    return window.alloy("setConsent", CONSENT_IN);
  },
  { dependencies: { CONSENT_IN } }
);

test("C451771: XDM and data objects should be cloned as soon as feasible.", async () => {
  await configureAlloyInstance(
    "alloy",
    compose(
      orgMainConfigMain,
      consentPending,
      {
        debugEnabled: true
      }
    )
  );
  await sendEvent();
  await flushPromiseChains();
  await modifyDataLayer();
  await consentIn();
  await flushPromiseChains();
  const requestBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  await t.expect(requestBody.events[0].xdm.foo).eql("bar");
});
