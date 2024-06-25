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
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";

import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";

const config = compose(orgMainConfigMain, consentPending, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C225953: Identity map can be sent on a setConsent command",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C225953",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C225953: Identity map can be sent on a setConsent command", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent({
    identityMap: {
      HYP: [
        {
          id: "id123",
        },
      ],
    },
    consent: CONSENT_IN.consent,
  });
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
});
