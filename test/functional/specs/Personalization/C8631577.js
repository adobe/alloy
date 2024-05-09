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
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import highEntropyUserAgentHintsContextConfig from "../../helpers/constants/highEntropyUserAgentHintsContextConfig.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import isUserAgentClientHintsSupported from "../../helpers/isUserAgentClientHintsSupported.js";

const networkLogger = createNetworkLogger();
const config = compose(highEntropyUserAgentHintsContextConfig, debugEnabled);

const ID = "C8631577";
const DESCRIPTION = `${ID} - Visitor should qualify for an experience based on high entropy client hint`;

createFixture({
  title: DESCRIPTION,
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID,
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const sendEventOptions = {
  decisionScopes: ["64BitClientHint"],
};

test(DESCRIPTION, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const eventResult = await alloy.sendEvent(sendEventOptions);
  const browserHintProposition = eventResult.propositions.find(
    (proposition) => proposition.scope === "chromeBrowserClientHint",
  );
  const hasChromeBrowserClientHintProposition =
    browserHintProposition !== undefined &&
    browserHintProposition.items[0].schema !==
      "https://ns.adobe.com/personalization/default-content-item";

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const requestHeaders =
    networkLogger.edgeEndpointLogs.requests[0].request.headers;
  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  // Tests must be run using https otherwise this will return false
  if (await isUserAgentClientHintsSupported()) {
    await t.expect(requestHeaders["sec-ch-ua"]).ok();
    await t.expect(requestHeaders["sec-ch-ua-mobile"]).ok();
    await t.expect(requestHeaders["sec-ch-ua-platform"]).ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails
          .userAgentClientHints,
      )
      .ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
          .bitness,
      )
      .ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
          .architecture,
      )
      .ok();
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
          .platformVersion,
      )
      .ok();

    const bitness =
      parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
        .bitness;
    if (bitness.indexOf("64") > -1) {
      await t.expect(hasChromeBrowserClientHintProposition).ok();
    } else {
      // Users on 32-bit platforms will not qualify
      await t.expect(hasChromeBrowserClientHintProposition).notOk();
    }
  } else {
    // Firefox, Safari do not currently support client hints
    await t.expect(hasChromeBrowserClientHintProposition).notOk();
  }
});
