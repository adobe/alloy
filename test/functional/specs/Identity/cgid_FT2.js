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

// ORIGINAL TEST BELOW

// import { t } from "testcafe";
// import uuid from "uuid/v4";
// import {
//   compose,
//   orgMainConfigMain,
//   debugEnabled,
//   migrationDisabled,
//   thirdPartyCookiesDisabled
// } from "../../helpers/constants/configParts";
// import { TEST_PAGE } from "../../helpers/constants/url";
// import createNetworkLogger from "../../helpers/networkLogger";
// import createAlloyProxy from "../../helpers/createAlloyProxy";
// import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid";
// import createFixture from "../../helpers/createFixture";
// import reloadPage from "../../helpers/reloadPage";
// import cookies from "../../helpers/cookies";
// import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";

// const networkLogger = createNetworkLogger();
// const config = compose(
//   orgMainConfigMain,
//   debugEnabled,
//   migrationDisabled,
//   thirdPartyCookiesDisabled
// );

// createFixture({
//   url: TEST_PAGE,
//   title: "cgif_FT2: FPID from a FPID cookie is used to generate an ECID",
//   requestHooks: [networkLogger.edgeEndpointLogs]
// });

// test.meta({
//   ID: "cgif_FT2",
//   SEVERTIY: "P0",
//   TEST_RUN: "Regression"
// });

// test("cgif_FT2: FPID from FPID cookie generates ECID", async () => {
//   const alloy = createAlloyProxy();
//   await alloy.configure(config);
//   await cookies.set({
//     name: "FPID",
//     value: uuid(),
//     domain: "alloyio.com"
//   });
//   await alloy.sendEvent();
//   const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[0]);
//   await reloadPage();
//   await cookies.remove(MAIN_IDENTITY_COOKIE_NAME);

//   await alloy.configure(config);
//   await alloy.sendEvent();
//   const ecidCompare = getReturnedEcid(
//     networkLogger.edgeEndpointLogs.requests[1]
//   );

//   await t.expect(ecid).eql(ecidCompare);
// });

// DEBUGGING TEST
import { t } from "testcafe";
import uuid from "uuid/v4";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  thirdPartyCookiesDisabled,
  edgeDomainFirstParty
} from "../../helpers/constants/configParts";
import { TEST_PAGE } from "../../helpers/constants/url";
import createNetworkLogger from "../../helpers/networkLogger";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid";
import createFixture from "../../helpers/createFixture";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  thirdPartyCookiesDisabled,
  edgeDomainFirstParty
);

createFixture({
  url: TEST_PAGE,
  title: "cgif_FT2: FPID from a FPID cookie is used to generate an ECID",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "cgif_FT2",
  SEVERTIY: "P0",
  TEST_RUN: "Regression"
});

test("cgif_FT2: FPID from FPID cookie generates ECID", async () => {
  const alloy = createAlloyProxy();

  await t.setCookies({ name: "FPID", value: uuid(), domain: "alloyio.com" });
  const c = await t.getCookies();
  console.log("Test Cookies", c);

  await alloy.configure(config);
  console.log("Config", config);
  await alloy.sendEvent();
  console.log(
    "Headers",
    networkLogger.edgeEndpointLogs.requests[0].request.headers
  );
  const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[0]);
  // await cookies.remove(MAIN_IDENTITY_COOKIE_NAME);

  // await alloy.configure(config);
  await alloy.sendEvent();
  const ecidCompare = getReturnedEcid(
    networkLogger.edgeEndpointLogs.requests[1]
  );
  console.log(
    "Cookies",
    networkLogger.edgeEndpointLogs.requests[1].request.headers
  );

  t.debug();
  await t
    .expect(networkLogger.edgeEndpointLogs.requests[1].request.headers.cookies)
    .contains("FPID");
  t.debug();
  await t.expect(ecid).eql(ecidCompare);
});
