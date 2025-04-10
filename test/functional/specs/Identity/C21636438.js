/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import reloadPage from "../../helpers/reloadPage.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C21636438: Decode the kndctr_ORGID_Identity cookie",
  requestHooks: [networkLogger.acquireEndpointLogs],
});

test.meta({
  ID: "C21636438",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Extracts information from kndctr cookie", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const {
    identity: { ECID: networkEcid },
  } = await alloy.getIdentity();
  await t.expect(networkEcid).ok();
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  networkLogger.clearLogs();
  await reloadPage();

  await alloy.configure(config);
  const {
    identity: { ECID: cookieEcid },
  } = await alloy.getIdentity();
  await t.expect(cookieEcid).eql(networkEcid);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(0);
});

test("Gracefully falls back to a network request if the cookie is not base64 encoded", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // Establish the cookie
  const {
    identity: { ECID: networkEcid },
  } = await alloy.getIdentity();
  await t.expect(networkEcid).ok();
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);
  // Change the cookie value to be gibberish
  const orgId = config.orgId;
  const cookieName = `kndctr_${orgId.replace("@", "_")}_identity`;
  const cookieValue = "gibberish";
  /** @type { { name: string, value: string, domain: string }[] } */
  const [currentCookie] = await t.getCookies(cookieName);
  await t.expect(currentCookie).ok();
  await t.setCookies({ ...currentCookie, value: cookieValue });

  // Reload the page
  networkLogger.clearLogs();
  await reloadPage();
  await alloy.configure(config);

  // Request the identity and ensure a network request was made
  const {
    identity: { ECID: cookieEcid },
  } = await alloy.getIdentity();
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);
  await t.expect(cookieEcid).notEql(networkEcid);
});

test("Gracefully falls back to a network request if the cookie is base64 decoded but not a valid protobuf", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // Establish the cookie
  const {
    identity: { ECID: networkEcid },
  } = await alloy.getIdentity();
  await t.expect(networkEcid).ok();
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);
  // Change the cookie value to be gibberish
  const orgId = config.orgId;
  const cookieName = `kndctr_${orgId.replace("@", "_")}_identity`;
  const cookieValue = Buffer.from([0x00, 0x00, 0x00, 0x00]).toString("base64");
  /** @type { { name: string, value: string, domain: string }[] } */
  const [currentCookie] = await t.getCookies(cookieName);
  await t.expect(currentCookie).ok();
  await t.setCookies({ ...currentCookie, value: cookieValue });

  // Reload the page
  networkLogger.clearLogs();
  await reloadPage();
  await alloy.configure(config);

  // Request the identity and ensure a network request was made
  const {
    identity: { ECID: cookieEcid },
  } = await alloy.getIdentity();
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);
  await t.expect(cookieEcid).notEql(networkEcid);
});
