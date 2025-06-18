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
import { v4 as uuidv4 } from "uuid";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  thirdPartyCookiesDisabled,
  edgeDomainFirstParty,
} from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE } from "../../helpers/constants/url.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid.js";
import createFixture from "../../helpers/createFixture/index.js";
import reloadPage from "../../helpers/reloadPage.js";
import cookies from "../../helpers/cookies.js";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies.js";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  thirdPartyCookiesDisabled,
  edgeDomainFirstParty,
);

createFixture({
  url: TEST_PAGE,
  title: "C6842981: FPID from a custom FPID cookie is used to generate an ECID",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C6842981",
  SEVERTIY: "P0",
  TEST_RUN: "Regression",
});

test("C6842981: FPID from a custom FPID cookie generates an ECID", async () => {
  const value = uuidv4();

  // TestCafe uses Native automation when running tests in Chrome. For this case, the cookie need
  // to be set to `.allioyio.com` and not `alloyio.com`. For Firefox, TestCase uses a reverse proxy
  // to automate browsers. The emulation is not fully compatible with Native automation. So we need
  // to set the cookie also on `alloyio.com` to make the test to pass on other browsers.
  await t.setCookies({
    name: "myFPID",
    value,
    domain: ".alloyio.com",
    path: "/",
  });

  await t.setCookies({
    name: "myFPID",
    value,
    domain: "alloyio.com",
    path: "/",
  });

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent();

  const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[0]);
  await reloadPage();

  await cookies.remove(MAIN_IDENTITY_COOKIE_NAME);

  await alloy.configure(config);
  await alloy.sendEvent();

  const ecidCompare = getReturnedEcid(
    networkLogger.edgeEndpointLogs.requests[1],
  );
  await t.expect(ecid).eql(ecidCompare);
});
