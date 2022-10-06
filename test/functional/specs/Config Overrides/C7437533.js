import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  configOverridesMain as overrides,
  configOverridesAlt as alternateOverrides,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { IAB_CONSENT_IN } from "../../helpers/constants/consent";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

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

test("C7437533: `setConsent` can receive config overrides in command options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(
    compose(IAB_CONSENT_IN, { edgeConfigOverrides: overrides })
  );

  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.setConsentEndpointLogs.requests[0].request.body
  );

  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t
    .expect(request.meta.configOverrides.com_adobe_target.propertyToken)
    .eql(overrides.com_adobe_target.propertyToken);
});

test("C7437533: `setConsent` can receive config overrides from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(compose(config, { edgeConfigOverrides: overrides }));
  await alloy.setConsent(IAB_CONSENT_IN);

  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.setConsentEndpointLogs.requests[0].request.body
  );

  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t
    .expect(request.meta.configOverrides.com_adobe_target.propertyToken)
    .eql(overrides.com_adobe_target.propertyToken);
});

test("C7437533: overrides from `setConsent` should take precedence over the ones from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(compose(config, { edgeConfigOverrides: overrides }));
  await alloy.setConsent(IAB_CONSENT_IN, {
    edgeConfigOverrides: alternateOverrides
  });

  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.setConsentEndpointLogs.requests[0].request.body
  );

  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t
    .expect(request.meta.configOverrides.com_adobe_target.propertyToken)
    .eql(overrides.com_adobe_target.propertyToken);
});

test("C7437533: empty configuration overrides should not be sent to the Edge", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(
    compose(IAB_CONSENT_IN, {
      edgeConfigOverrides: compose(overrides, {
        com_adobe_target: {
          propertyToken: ""
        }
      })
    })
  );

  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.setConsentEndpointLogs.requests[0].request.body
  );

  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event
    )
    .eql(overrides.com_adobe_experience_platform.datasets.event);
  await t
    .expect(request.meta.configOverrides.com_adobe_analytics.reportSuites)
    .eql(overrides.com_adobe_analytics.reportSuites);
  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
  await t.expect(request.meta.configOverrides.com_adobe_target).eql(undefined);
});
