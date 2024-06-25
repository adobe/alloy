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
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import flushPromiseChains from "../../../unit/helpers/flushPromiseChains.js";
import createConsoleLogger from "../../helpers/consoleLogger/index.js";

const config = compose(
  orgMainConfigMain,
  { defaultConsent: "out" },
  debugEnabled,
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1631712: Requests are dropped when default consent is out",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C1631712",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C1631712: Requests are dropped when default consent is out", async (t) => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const logger = await createConsoleLogger();

  const result = await alloy.sendEvent();
  await t.expect(result).eql({});
  await logger.warn.expectMessageMatching(
    /No consent preferences have been set./,
  );

  await alloy.setConsent(CONSENT_IN);
  await flushPromiseChains();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
