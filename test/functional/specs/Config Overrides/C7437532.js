/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  configOverridesMain as overrides,
  configOverridesAlt as alternateOverrides,
  orgMainConfigMain,
  debugEnabled,
  consentIn
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, consentIn, debugEnabled);

createFixture({
  title:
    "C7437532: `appendIdentityToUrl` can receive config overrides in command options and in `configure`",
  requestHooks: [networkLogger.acquireEndpointLogs]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C7437532: `appendIdentityToUrl` can receive config overrides in command options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // this should get an ECID
  await alloy.appendIdentityToUrl({
    url: "https://example.com",
    edgeConfigOverrides: overrides
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
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

test("Test C7437532: `appendIdentityToUrl` can receive config overrides from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(compose(config, { edgeConfigOverrides: overrides }));
  // this should get an ECID
  await alloy.appendIdentityToUrl({
    url: "https://example.com"
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
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

test("Test C7437532: overrides from the `appendIdentityToUrl` should take precedence over the ones from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(
    compose(config, { edgeConfigOverrides: alternateOverrides })
  );
  // this should get an ECID
  await alloy.appendIdentityToUrl({
    url: "https://example.com",
    edgeConfigOverrides: overrides
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
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

test("Test C7437532: empty configuration overrides should not be sent to the Edge", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // this should get an ECID
  await alloy.appendIdentityToUrl({
    url: "https://example.com",
    edgeConfigOverrides: compose(overrides, {
      com_adobe_target: {
        propertyToken: ""
      }
    })
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
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

test("Test C7437532: `appendIdentityToUrl` can override the edgeConfigId", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const { edgeConfigId: originalEdgeConfigId } = config;
  const alternateEdgeConfigId = `${originalEdgeConfigId}:dev`;
  await alloy.appendIdentityToUrl({
    url: "https://example.com",
    edgeConfigOverrides: {
      edgeConfigId: alternateEdgeConfigId
    }
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);
  const [request] = networkLogger.acquireEndpointLogs.requests;
  await t.expect(request.request.url).contains(alternateEdgeConfigId);
});
