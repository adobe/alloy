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
import cookies from "../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createConsoleLogger from "../../helpers/consoleLogger";

const debugEnabledConfig = compose(orgMainConfigMain, debugEnabled);
const networkLogger = createNetworkLogger();

createFixture({
  title: "C5287654: Cookies are set with sameSite=none",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C5287654: Cookies are set with sameSite=none", async () => {
  const logger = await createConsoleLogger();
  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  // this should get cookies
  await logger.reset();
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  // make sure we have an ecid
  const identityCookieValue = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue).ok("No identity cookie found.");

  // make sure the ecid was sent with sameSite = none
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const stateStoreHandle = response.handle.find(
    handle => handle.type === "state:store"
  );
  const identityCookie = stateStoreHandle.payload.find(cookie =>
    cookie.key.endsWith("identity")
  );
  await t.expect(identityCookie.attrs).ok();
  await t.expect(identityCookie.attrs.SameSite).eql("None");

  const logs = await logger.info.getMessagesSinceReset();
  const setCookieAttributes = logs
    .filter(message => message.length === 3 && message[1] === "Setting cookie")
    .map(message => message[2])
    .filter(
      cookieSettings => cookieSettings.name === MAIN_IDENTITY_COOKIE_NAME
    );

  await t.expect(setCookieAttributes.length).eql(1);
  await t.expect(setCookieAttributes[0].sameSite).eql("none");
  await t.expect(setCookieAttributes[0].secure).eql(true);
});
