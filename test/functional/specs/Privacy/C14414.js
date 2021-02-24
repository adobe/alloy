import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import { CONSENT_IN, CONSENT_OUT } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C14414: Requests are queued while consent changes are pending",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14414",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test.only("Test C14414: Requests are queued while consent changes are pending", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const setConsentResponse1 = await alloy.setConsentAsync(CONSENT_IN);
  const setConsentResponse2 = await alloy.setConsentAsync(CONSENT_OUT);
  await alloy.sendEvent();

  // make sure there are no errors returned from the setConsent requests
  await setConsentResponse1.result;
  await setConsentResponse2.result;

  // make sure the event was not sent
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
