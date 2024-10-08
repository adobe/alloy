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
import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createConsoleLogger from "../../helpers/consoleLogger/index.js";

const networkLogger = createNetworkLogger();

createFixture(
  `C12412 Response should return Cookie destinations if turned on in Blackbird`,
  {
    requestHooks: [networkLogger.edgeEndpointLogs],
    meta: {
      ID: "C12412",
      SEVERITY: "P0",
      TEST_RUN: "Regression",
    },
  },
);

const getDocumentCookie = ClientFunction(() => document.cookie);

test(`Verify cookie destinations are returned in the response when turned on in Blackbird`, async () => {
  const logger = await createConsoleLogger();
  const alloy = createAlloyProxy();

  await alloy.configure(compose(orgMainConfigMain, debugEnabled));
  await alloy.sendEvent();

  await t.expect(getDocumentCookie()).contains("C12412=test%3DC12412");

  const logs = await logger.info.getMessagesSinceReset();
  const setCookieAttributes = logs
    .filter(
      (message) => message.length === 3 && message[1] === `Setting cookie`,
    )
    .map((message) => message[2])
    .filter((cookieSettings) => cookieSettings.name === "C12412");

  await t.expect(setCookieAttributes.length).eql(1);
  await t.expect(setCookieAttributes[0].sameSite).eql("none");
  await t.expect(setCookieAttributes[0].secure).eql(true);
});

test(`Verify cookie is set on the / path `, async () => {
  const alloy = createAlloyProxy();

  await alloy.configure(compose(orgMainConfigMain, debugEnabled));
  await alloy.sendEvent();

  const cookies = await t.getCookies("C12412");

  // In Firefox, the t.getCookies method returns an empty array even if the cookie is present.
  // The if condition below is to handle this issue.
  if (cookies.length > 0) {
    await t.expect(cookies[0].path).eql("/");
  }
});
