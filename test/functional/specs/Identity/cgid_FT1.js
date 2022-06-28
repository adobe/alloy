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
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
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

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
  migrationDisabled
);

createFixture({
  url: TEST_PAGE,
  title: "cgif_FT1: FPID from the identityMap is used to generate an ECID",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "cgif_FT1",
  SEVERTIY: "P0",
  TEST_RUN: "Regression"
});

const fpid = {
  xdm: {
    identityMap: {
      FPID: [
        {
          id: "UUID"
        }
      ]
    }
  }
};

test("cgif_FT1: FPID from the identityMap generates ECID", async () => {
  const alloy = createAlloyProxy();

  await alloy.configure(config);
  await alloy.sendEvent(fpid);
  const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[0]);

  await reloadPage();
  await cookies.remove(MAIN_IDENTITY_COOKIE_NAME);
  await alloy.configure(config);
  await alloy.sendEvent(fpid);
  const ecidCompare = getReturnedEcid(
    networkLogger.edgeEndpointLogs.requests[1]
  );
  await t.expect(ecid).eql(ecidCompare);
});
