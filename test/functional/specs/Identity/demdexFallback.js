/*
Copyright 2024 Adobe. All rights reserved.
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
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  thirdPartyCookiesEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import demdexBlockerMock from "../../helpers/requestHooks/demdexBlockerMock.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, thirdPartyCookiesEnabled);

createFixture({
  title: "Demdex Fallback Behavior",
  requestHooks: [networkLogger.edgeEndpointLogs, demdexBlockerMock],
});

test("Continues collecting data when demdex is blocked", async () => {
  const alloy = createAlloyProxy();

  await alloy.configure(config);
  await alloy.sendEvent();

  // Get all requests
  const requests = networkLogger.edgeEndpointLogs.requests;

  // Find the successful request (should be the last one)
  const successfulRequest = requests[requests.length - 1];

  // Verify the successful request
  await t.expect(successfulRequest.request.url).notContains("demdex.net");
  await t.expect(successfulRequest.request.url).contains(config.edgeDomain);
  await t.expect(successfulRequest.response.statusCode).eql(200);

  // Verify at least one request was successful
  const successfulRequests = requests.filter(
    (r) =>
      !r.request.url.includes("demdex.net") && r.response.statusCode === 200,
  );
  await t.expect(successfulRequests.length).gte(1);
});
