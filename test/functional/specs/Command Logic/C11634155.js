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
import {
  compose,
  debugEnabled,
  orgMainConfigMain
} from "../../helpers/constants/configParts";
import createFixture from "../../helpers/createFixture";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions";
import createConsoleLogger from "../../helpers/consoleLogger";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, {
  edgeConfigId: orgMainConfigMain.datastreamId
});
delete config.datastreamId;

createFixture({
  title: "C11634155: Deprecates options like edgeConfigId and warns with use",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C11634155",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C11634155: Deprecates options like edgeConfigId and warns with use", async () => {
  const logger = await createConsoleLogger();

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await logger.warn.expectMessageMatching(
    /The field 'edgeConfigId' is deprecated./
  );
});

test("Test C11634155: When specifying a deprecated option like edgeConfigId, it uses the specified alternative, datastreamId", async t => {
  const alloy = createAlloyProxy();
  await alloy.configureAsync(config);

  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const { url } = networkLogger.edgeEndpointLogs.requests[0].request;
  await t.expect(url).contains(config.edgeConfigId);
});
