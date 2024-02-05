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
import { SECONDARY_TEST_PAGE } from "../../helpers/constants/url";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled
} from "../../helpers/constants/configParts";
import createNetworkLogger from "../../helpers/networkLogger";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getReturnedEcid from "../../helpers/networkLogger/getReturnedEcid";

// We disable third party cookies so that the domains don't share identities
// through the demdex cookies.
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C5594865: Identity can be maintained across domains via the adobe_mc query string parameter",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C5594865",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C5594865: Identity can be maintained across domains via the adobe_mc query string parameter", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});
  const { url: newUrl } = await alloy.appendIdentityToUrl({
    url: SECONDARY_TEST_PAGE
  });

  await t.navigateTo(newUrl);
  await alloy.configure(config);
  await alloy.sendEvent({});

  const [originalEcid, newEcid] = networkLogger.edgeEndpointLogs.requests.map(
    getReturnedEcid
  );
  await t.expect(newEcid).eql(originalEcid);

  const { identity } = await alloy.getIdentity();
  await t.expect(identity.ECID).eql(originalEcid);
});
