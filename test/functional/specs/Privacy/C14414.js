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
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import { CONSENT_IN, CONSENT_OUT } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";
import SequentialHook from "../../helpers/requestHooks/sequentialHook";

const config = compose(orgMainConfigMain, consentPending, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C14414: Requests are queued while consent changes are pending",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14414",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test
  .before(async t => {
    // Create the hook here so that it is only used for one test run.
    t.ctx.setConsentHook = new SequentialHook(/v1\/privacy\/set-consent\?/);
    await t.addRequestHooks(t.ctx.setConsentHook);
  })
  .after(async t => {
    await t.removeRequestHooks(t.ctx.setConsentHook);
  })(
  "Test C14414: Requests are queued while consent changes are pending",
  async t => {
    const alloy = createAlloyProxy();
    await alloy.configure(config);
    const setConsentResponse1 = await alloy.setConsentAsync(CONSENT_IN);
    const setConsentResponse2 = await alloy.setConsentAsync(CONSENT_OUT);
    await alloy.sendEvent();

    // make sure there are no errors returned from the setConsent requests
    await setConsentResponse1.result;
    await setConsentResponse2.result;

    // make sure the event was not sent
    await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

    await t
      .expect(t.ctx.setConsentHook.haveRequestsBeenSequential())
      .ok("Set-consent requests were not sequential");
    await t.expect(t.ctx.setConsentHook.getNumRequests()).eql(2);
  }
);
