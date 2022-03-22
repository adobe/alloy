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
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createNetworkLogger from "../../helpers/networkLogger";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createRandomEcid from "../../helpers/createRandomEcid";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid";
import createAdobeMC from "../../helpers/createAdobeMC";

const config = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();

const id = createRandomEcid();
// TTL is 5 minutes (300 seconds), but use 400 to account for differences in server time.
const timestamp = new Date().getTime() / 1000 - 400;
const adobemc = createAdobeMC({ timestamp, id });

createFixture({
  url: `${TEST_PAGE_URL}?adobe_mc=${adobemc}`,
  title: "C5594872: An expired adobe_mc query string parameter is not used",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C5594872",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C5594872: An expired adobe_mc query string parameter is not used", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});
  const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[0]);
  await t.expect(ecid).notEql(id);
});
