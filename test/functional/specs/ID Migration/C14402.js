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
import createNetworkLogger from "../../helpers/networkLogger";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import { responseStatus } from "../../helpers/assertions";
import createFixture from "../../helpers/createFixture";
import createResponse from "../../helpers/createResponse";
import { ECID as ECID_REGEX } from "../../helpers/constants/regex";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import {
  LEGACY_IDENTITY_COOKIE_NAME,
  LEGACY_IDENTITY_COOKIE_UNESCAPED_NAME
} from "../../helpers/constants/cookies";
import createConsoleLogger from "../../helpers/consoleLogger";

const config = compose(orgMainConfigMain, debugEnabled, migrationEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C14402: When ID migration is enabled and no legacy AMCV cookie is found, an AMCV cookie should be created",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14402",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getDocumentCookie = ClientFunction(() => document.cookie);

test("Test C14402: When ID migration is enabled and no legacy AMCV cookie is found, an AMCV cookie should be created", async () => {
  const logger = await createConsoleLogger();
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await logger.reset();
  await alloy.sendEvent({ renderDecisions: true });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const payloads = createResponse({ content: response }).getPayloadsByType(
    "identity:result"
  );

  const ecidPayload = payloads.filter(
    payload => payload.namespace.code === "ECID"
  )[0];

  await t.expect(ecidPayload.id).match(ECID_REGEX);

  const documentCookie = await getDocumentCookie();

  await t
    .expect(documentCookie)
    .contains(`${LEGACY_IDENTITY_COOKIE_NAME}=MCMID|${ecidPayload.id}`);

  const logs = await logger.info.getMessagesSinceReset();
  const setCookieAttributes = logs
    .filter(message => message.length === 3 && message[1] === "Setting cookie")
    .map(message => message[2])
    .filter(
      cookieSettings =>
        cookieSettings.name === LEGACY_IDENTITY_COOKIE_UNESCAPED_NAME
    );

  await t.expect(setCookieAttributes.length).eql(1);
  await t.expect(setCookieAttributes[0].sameSite).eql("none");
  await t.expect(setCookieAttributes[0].secure).eql(true);
});
