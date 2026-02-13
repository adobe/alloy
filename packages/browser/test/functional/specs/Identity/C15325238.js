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
import createFixture from "../../helpers/createFixture/index.js";
import { SECONDARY_TEST_PAGE, TEST_PAGE } from "../../helpers/constants/url.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
} from "../../helpers/constants/configParts/index.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid.js";

// We disable third party cookies so that the domains don't share identities
// through the demdex cookies.
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C15325238: When there are multiple adobe_mc parameters, the last one is used.",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C15325238",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("C15325238: When there are multiple adobe_mc parameters, the last one is used.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});
  const { url: newUrl1 } = await alloy.appendIdentityToUrl({
    url: TEST_PAGE,
  });

  await t.navigateTo(SECONDARY_TEST_PAGE);
  await alloy.configure(config);
  await alloy.sendEvent({});

  const { url: newUrl2 } = await alloy.appendIdentityToUrl({
    url: newUrl1,
  });

  await t.navigateTo(newUrl2);
  await alloy.configure(config);
  await alloy.sendEvent({});

  const [ecid1, ecid2, ecid3] =
    networkLogger.edgeEndpointLogs.requests.map(getReturnedEcid);
  await t.expect(ecid1).notEql(ecid2);
  await t.expect(ecid2).eql(ecid3);

  const { identity } = await alloy.getIdentity();
  await t.expect(identity.ECID).eql(ecid2);
});
