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
import { t } from "testcafe";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesEnabled,
  thirdPartyCookiesDisabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import areThirdPartyCookiesSupported from "../../helpers/areThirdPartyCookiesSupported.js";
import { SECONDARY_TEST_PAGE } from "../../helpers/constants/url.js";

const thirdPartyCookiesEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesEnabled,
);
const thirdPartyCookiesDisabledConfig = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled,
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C19160486: The CORE identity is returned correctly from getIdentity",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.acquireEndpointLogs,
  ],
});

test.meta({
  ID: "C19160486",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("C19160486: CORE identity is the same across domains when called first", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(thirdPartyCookiesEnabledConfig);
  const {
    identity: { ECID: ecid1, CORE: core1 },
  } = await alloy.getIdentity({ namespaces: ["ECID", "CORE"] });
  await t.navigateTo(SECONDARY_TEST_PAGE);

  await alloy.configure(thirdPartyCookiesEnabledConfig);
  const {
    identity: { ECID: ecid2, CORE: core2 },
  } = await alloy.getIdentity({ namespaces: ["ECID", "CORE"] });

  if (areThirdPartyCookiesSupported()) {
    // ecids are the same because the same orgId is used to go from CORE -> ECID
    await t.expect(ecid1).eql(ecid2);
    await t.expect(core1).eql(core2);
    await t.expect(ecid1).notEql(core1);
  } else {
    // ecids are different because third party cookies are not written
    await t.expect(ecid1).notEql(ecid2);
    // CORE identity is null because Experience Edge only creates it when called on demdex domain
    // which only happens on Chrome browsers.
    await t.expect(core1).eql(null);
    await t.expect(core2).eql(null);
  }
});

test("C19160486: CORE identity is the same across domains when called after sendEvent", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(thirdPartyCookiesEnabledConfig);
  await alloy.sendEvent();
  const {
    identity: { ECID: ecid1, CORE: core1 },
  } = await alloy.getIdentity({ namespaces: ["ECID", "CORE"] });
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(0);
  await t.navigateTo(SECONDARY_TEST_PAGE);

  await alloy.configure(thirdPartyCookiesEnabledConfig);
  await alloy.sendEvent();
  const {
    identity: { ECID: ecid2, CORE: core2 },
  } = await alloy.getIdentity({ namespaces: ["ECID", "CORE"] });
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(0);

  if (areThirdPartyCookiesSupported()) {
    // ecids are the same because the same orgId is used to go from CORE -> ECID
    await t.expect(ecid1).eql(ecid2);
    await t.expect(core1).eql(core2);
    await t.expect(ecid1).notEql(core1);
  } else {
    // ecids are different because third party cookies are not written
    await t.expect(ecid1).notEql(ecid2);
    // CORE identity is null because Experience Edge only creates it when called on demdex domain
    // which only happens on Chrome browsers.
    await t.expect(core1).eql(null);
    await t.expect(core2).eql(null);
  }
});

test("C19160486: CORE identity is not requested when third party cookies are disabled", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(thirdPartyCookiesDisabledConfig);
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
  const requestBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );
  await t.expect(requestBody.query.identity.fetch).eql(["ECID"]);
});

test("C19160486: CORE identity cannot be requested from getIdentity when third party cookies are disabled", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(thirdPartyCookiesDisabledConfig);
  const errorMessage = await alloy.getIdentityErrorMessage({
    namespaces: ["CORE"],
  });
  await t
    .expect(errorMessage)
    .contains(
      "The CORE namespace cannot be requested when third-party cookies are disabled",
    );
});

test("C19160486: Requesting CORE identity and ECID can be done separately", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(thirdPartyCookiesEnabledConfig);
  const {
    identity: { ECID: ecid },
  } = await alloy.getIdentity({ namespaces: ["ECID"] });
  await t.expect(ecid).ok();
  const {
    identity: { CORE: core },
  } = await alloy.getIdentity({ namespaces: ["CORE"] });
  if (areThirdPartyCookiesSupported()) {
    await t.expect(core).ok();
  } else {
    await t.expect(core).eql(null);
  }
});
