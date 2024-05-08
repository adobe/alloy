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
import cookies from "../../helpers/cookies.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  debugEnabled
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { MAIN_CLUSTER_COOKIE_NAME } from "../../helpers/constants/cookies.js";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled
);

createFixture({
  title: "C6944931: The legacy Adobe Target location hint is used.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C6944931",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C6944931: The legacy Adobe Target location hint is used.", async () => {
  // 38 = singapore, Konductor region ID 3
  await t.setCookies({
    name: "mboxEdgeCluster",
    value: "38",
    domain: "alloyio.com",
    path: "/"
  });
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  const locationHint = await cookies.get(MAIN_CLUSTER_COOKIE_NAME);
  await t.expect(locationHint).eql("sgp3");

  await alloy.sendEvent({});

  const urls = networkLogger.edgeEndpointLogs.requests.map(r => r.request.url);
  await t
    .expect(urls[0])
    .match(new RegExp("^https://[^/]+/[^/]+/t38/v1/interact"));
  await t
    .expect(urls[1])
    .match(new RegExp(`^https://[^/]+/[^/]+/sgp3/v1/interact`));
});
