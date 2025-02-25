/**
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "Get Identity after Collect Call",
  requestHooks: [networkLogger.acquireEndpointLogs],
});

test("Preserves ECID after sendEvent call with collect beacon", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.sendEvent();

  await collectEndpointAsserter.reset();

  const initialIdentity = await alloy.getIdentity({
    namespaces: ["ECID"],
  });

  await t
    .expect(initialIdentity.identity.ECID)
    .ok("No ECID in initial response");

  const initialEcid = initialIdentity.identity.ECID;

  await alloy.sendEvent({
    documentUnloading: true,
    xdm: {
      eventType: "test-event",
    },
  });

  await collectEndpointAsserter.assertCollectCalledAndNotInteract();

  const subsequentIdentity = await alloy.getIdentity({
    namespaces: ["ECID"],
  });

  await t
    .expect(subsequentIdentity.identity.ECID)
    .eql(initialEcid, "ECID was not preserved after collect call");
});
