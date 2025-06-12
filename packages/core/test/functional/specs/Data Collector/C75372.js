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
import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import { orgMainConfigMain } from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C75372 - XDM and data objects passed into event command should not be modified",
  requestHooks: [networkLogger.setConsentEndpointLogs],
});

test.meta({
  ID: "C75372",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const sendEvent = ClientFunction(() => {
  const xdmDataLayer = { device: { screenHeight: 1 } };
  const nonXdmDataLayer = { baz: "quux" };
  // Using a merge ID is a decent test because it's one thing we know
  // gets merged with the XDM object.
  return window
    .alloy("sendEvent", {
      xdm: xdmDataLayer,
      data: nonXdmDataLayer,
      mergeId: "abc",
    })
    .then(() => {
      return {
        xdmDataLayer,
        nonXdmDataLayer,
      };
    });
});

test("C75372 - XDM and data objects passed into event command should not be modified", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  const { xdmDataLayer, nonXdmDataLayer } = await sendEvent();
  await t.expect(xdmDataLayer).eql({ device: { screenHeight: 1 } });
  await t.expect(nonXdmDataLayer).eql({ baz: "quux" });
});
