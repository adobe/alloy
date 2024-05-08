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
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
  migrationDisabled
} from "../../helpers/constants/configParts/index.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import reloadPage from "../../helpers/reloadPage.js";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid.js";
import { TEST_PAGE, SECONDARY_TEST_PAGE } from "../../helpers/constants/url.js";

// We disable third party cookies so that the domains don't share identities
// through the demdex cookies.
const config = compose(
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  debugEnabled,
  migrationDisabled
);

const networkLogger = createNetworkLogger();

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

  await t.navigateTo(SECONDARY_TEST_PAGE);
  await alloy.configure(config);
  await alloy.sendEvent({});
  const { url: newUrl } = await alloy.appendIdentityToUrl({ url: TEST_PAGE });

  await t.navigateTo(newUrl);
  await alloy.configure(config);
  await alloy.sendEvent({});

  await reloadPage("");
  await alloy.configure(config);
  await alloy.sendEvent({});

  const [
    originalEcid,
    secondaryPageEcid,
    newEcid,
    reloadedEcid
  ] = networkLogger.edgeEndpointLogs.requests.map(getReturnedEcid);

  await t.expect(originalEcid).notEql(secondaryPageEcid);
  await t.expect(newEcid).eql(secondaryPageEcid);
  await t.expect(reloadedEcid).eql(secondaryPageEcid);

  const { identity } = await alloy.getIdentity();
  await t.expect(identity.ECID).eql(secondaryPageEcid);
});
