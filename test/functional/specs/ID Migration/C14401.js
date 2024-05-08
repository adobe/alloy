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
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import createResponse from "../../helpers/createResponse.js";
import { ECID as ECID_REGEX } from "../../helpers/constants/regex.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
} from "../../helpers/constants/configParts/index.js";
import setLegacyIdentityCookie from "../../helpers/setLegacyIdentityCookie.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const config = compose(orgMainConfigMain, debugEnabled, migrationDisabled);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C14401: When ID migration is disabled and no identity cookie is found but legacy identity cookie is found, the ECID will not be sent on the request",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C14401",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C14401: When ID migration is disabled and no identity cookie is found but legacy identity cookie is found, the ECID will not be sent on the request", async () => {
  await setLegacyIdentityCookie(orgMainConfigMain.orgId);
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({ renderDecisions: true });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t.expect(request.xdm).eql(undefined);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0]),
  );

  const payloads = createResponse({ content: response }).getPayloadsByType(
    "identity:result",
  );

  const ecidPayload = payloads.filter(
    (payload) => payload.namespace.code === "ECID",
  )[0];

  await t.expect(ecidPayload.id).match(ECID_REGEX);
});
