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
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { TEST_PAGE } from "../../helpers/constants/url.js";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C9369211: sendEvent includes a header for the referer",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.edgeCollectEndpointLogs,
  ],
});

test.meta({
  ID: "C9369211",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C9369211: sendEvent includes a header for the referer when calling interact.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  await t
    .expect(networkLogger.edgeEndpointLogs.requests[0].request.headers.referer)
    .eql(TEST_PAGE);
});

test("Test C9369211: sendEvent includes a header for the referer when calling collect.", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({}); // establish an identity
  await collectEndpointAsserter.reset();
  await alloy.sendEvent({ documentUnloading: true });
  await collectEndpointAsserter.assertCollectCalledAndNotInteract();

  // TODO: Testcafe no longer captures the request body for sendBeacon requests.
  // We could enhance this test to use Assurance to verify the request body.
  // await t
  //   .expect(collectEndpointAsserter.getCollectRequest().request.headers.referer)
  //   .eql(TEST_PAGE);
});
