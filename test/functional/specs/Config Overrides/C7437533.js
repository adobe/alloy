import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { IAB_CONSENT_IN } from "../../helpers/constants/consent";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const overrides = { identity: { idSyncContainerId: "1234" } };

createFixture({
  title:
    "C7437533: `setConsent` can receive config overrides in command options and in `configure`",
  requestHooks: [networkLogger.setConsentEndpointLogs]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C7437533: `setConsent` can receive config overrides in command options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent({ ...IAB_CONSENT_IN, configuration: overrides });

  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.setConsentEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql("1234");
});

test("Test C7437533: `setConsent` can receive config overrides from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure({ ...config, configurationOverrides: overrides });
  await alloy.setConsent(IAB_CONSENT_IN);

  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.setConsentEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql("1234");
});
