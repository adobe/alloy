/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createNetworkLogger from "../../helpers/networkLogger";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import reloadPage from "../../helpers/reloadPage";
import createRandomEcid from "../../helpers/createRandomEcid";
import createAdobeMC from "../../helpers/createAdobeMC";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid";

const config = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();

const id = createRandomEcid();
const adobemc = createAdobeMC({ id });

createFixture({
  title:
    "C5594866: Identity can be changed via the adobe_mc query string parameter",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C5594866",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C5594866: Identity can be changed via the adobe_mc query string parameter", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // establish an identity cookie
  await alloy.sendEvent({});

  await reloadPage(`adobe_mc=${adobemc}`);
  await alloy.configure(config);
  await alloy.sendEvent({});

  const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[1]);
  await t.expect(ecid).eql(id);

  const { identity } = await alloy.getIdentity();
  await t.expect(identity.ECID).eql(id);
});
