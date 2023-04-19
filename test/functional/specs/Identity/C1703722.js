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
import createFixture from "../../helpers/createFixture";
import cookies from "../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";

const debugEnabledConfig = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1703722: getIdentity works when first command after configure",
  requestHooks: [networkLogger.acquireEndpointLogs]
});

test.meta({
  ID: "C1703772",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C1703722: getIdentity works when first command after configure", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  // this should get an ECID
  const identityResponse = await alloy.getIdentity();

  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);
  const identityCookieValue = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue).ok("No identity cookie set.");
  await t.expect(identityResponse.identity).ok("No ecid returned");
  await t.expect(identityResponse.edge.regionId).gt(0);
});
