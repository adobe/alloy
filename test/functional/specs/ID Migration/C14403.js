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
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import createResponse from "../../helpers/createResponse.js";
import { ECID as ECID_REGEX } from "../../helpers/constants/regex.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const config = compose(orgMainConfigMain, debugEnabled, migrationDisabled);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C14403: When ID migration is disabled and no legacy AMCV cookie is found, no AMCV cookie should be created",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C14403",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const getDocumentCookie = ClientFunction(() => document.cookie);

test("Test C14403: When ID migration is disabled and no legacy AMCV cookie is found, no AMCV cookie should be created", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({ renderDecisions: true });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0]),
  );

  const payloads = createResponse({ content: response }).getPayloadsByType(
    "identity:result",
  );

  const ecidPayload = payloads.filter(
    (payload) => payload.namespace.code === "ECID",
  )[0];

  await t.expect(ecidPayload.id).match(ECID_REGEX);

  const documentCookie = await getDocumentCookie();

  await t
    .expect(documentCookie)
    .notContains(
      `AMCV_5BFE274A5F6980A50A495C08%40AdobeOrg=MCMID|${ecidPayload.id}`,
    );
});
