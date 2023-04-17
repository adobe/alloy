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
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createConsoleLogger from "../../helpers/consoleLogger";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_OUT } from "../../helpers/constants/consent";

const config = compose(orgMainConfigMain, consentPending, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C2594: event command resolves promise with empty object if user consents to no purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2594",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2594: event command resolves promise with empty object if user consents to no purposes", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const logger = await createConsoleLogger();

  const sendEventResponse = await alloy.sendEventAsync();
  await alloy.setConsent(CONSENT_OUT);

  const result = await sendEventResponse.result;
  await t.expect(result).eql({});
  await logger.warn.expectMessageMatching(/The user declined consent./);
  // make sure no event requests were sent out
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
