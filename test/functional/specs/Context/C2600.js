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
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import environmentContextConfig from "../../helpers/constants/environmentContextConfig";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import isUserAgentClientHintsSupported from "../../helpers/isUserAgentClientHintsSupported";

const networkLogger = createNetworkLogger();

const ID = "C2600";
const DESCRIPTION = `${ID} - Adds only environment context data when only device is specified in configuration.`;

createFixture({
  title: DESCRIPTION,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID,
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEventOptions = {
  xdm: {
    web: {
      webPageDetails: {
        URL: TEST_PAGE_URL
      }
    }
  }
};

test(DESCRIPTION, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(environmentContextConfig);
  await alloy.sendEvent(sendEventOptions);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const parsedBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(parsedBody.events[0].xdm.environment).ok();
  await t.expect(parsedBody.events[0].xdm.web.webPageDetails).ok();
  await t.expect(parsedBody.events[0].xdm.device).notOk();
  await t.expect(parsedBody.events[0].xdm.placeContext).notOk();
  if (await isUserAgentClientHintsSupported()) {
    await t
      .expect(
        parsedBody.events[0].xdm.environment.browserDetails.userAgentClientHints
      )
      .notOk();
  }
});
