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
import createFixture from "../../helpers/createFixture/index.js";
import createConsoleLogger from "../../helpers/consoleLogger/index.js";
import {
  compose,
  debugEnabled,
  orgMainConfigMain
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { CONSENT_OUT } from "../../helpers/constants/consent.js";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C25148 - When default consent is 'in', consent can be revoked.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C25148",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const config = compose(orgMainConfigMain, debugEnabled);

test("C25148 - When default consent is 'in', consent can be revoked", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // trigger an event
  await alloy.sendEvent();

  // revoke user consent
  await alloy.setConsent(CONSENT_OUT);

  // trigger a second event
  const logger = await createConsoleLogger();
  await alloy.sendEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);

  // ensure only one event was sent
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const stringifyRequest = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  await t.expect(stringifyRequest.events.length).eql(1);
});
