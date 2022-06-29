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
import uuid from "uuid/v4";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE } from "../../helpers/constants/url";
import createNetworkLogger from "../../helpers/networkLogger";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid";
import createFixture from "../../helpers/createFixture";
import reloadPage from "../../helpers/reloadPage";
import cookies from "../../helpers/cookies";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";
import { FIRST_PARTY_DOMAIN } from "../../helpers/constants/domain";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled, migrationDisabled);

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
  await alloy.configure(config);
  await cookies.set({
    name: "FPID",
    value: uuid(),
    domain: FIRST_PARTY_DOMAIN
  });
  await alloy.sendEvent();
  const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[0]);
  await reloadPage();
  await cookies.remove(MAIN_IDENTITY_COOKIE_NAME);
  await alloy.configure(config);
  await alloy.sendEvent();
  const ecidCompare = getReturnedEcid(
    networkLogger.edgeEndpointLogs.requests[1]
  );
  await t.expect(ecid).eql(ecidCompare);
});
