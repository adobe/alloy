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

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C25822: Event command sends a request with a validated identityMap",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C25822",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const badAlloyEventOptions = {
  xdm: {
    identityMap: {
      HYP: [
        {
          id: 123,
        },
      ],
    },
  },
};

test("C25822: Event command validates the identityMap", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const errorMessage = await alloy.sendEventErrorMessage(badAlloyEventOptions);
  await t
    .expect(errorMessage)
    .ok("Expected the sendEvent command to be rejected");

  await t.expect(errorMessage).contains("xdm.identityMap.HYP[0].id");
});

const goodAlloyEventOptions = {
  xdm: {
    identityMap: {
      HYP: [
        {
          id: "id123",
        },
      ],
    },
  },
};

test("C25822: Event command sends the identityMap", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent(goodAlloyEventOptions);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );

  await t.expect(request.events[0].xdm.identityMap).eql({
    HYP: [
      {
        id: "id123",
      },
    ],
  });
});
