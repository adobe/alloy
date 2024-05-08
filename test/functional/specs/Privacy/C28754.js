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
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import createResponse from "../../helpers/createResponse.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

import { CONSENT_OUT } from "../../helpers/constants/consent.js";

const config = compose(orgMainConfigMain, consentPending);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C28754 - Consenting to no purposes should result in no data handles in the response.",
  requestHooks: [networkLogger.setConsentEndpointLogs]
});

test.meta({
  ID: "C28754",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C28754 - Consenting to no purposes should result in no data handles in the response.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.setConsent(CONSENT_OUT);
  await responseStatus(networkLogger.setConsentEndpointLogs.requests, 200);

  const response = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
  );

  const alloyResponse = createResponse({ content: response });

  const idSyncsPayload = alloyResponse.getPayloadsByType("identity:exchange");
  const personalizationPayload = alloyResponse.getPayloadsByType(
    "personalization:decisions"
  );
  const audiencesPayload = alloyResponse.getPayloadsByType("activation:push");

  await t.expect(idSyncsPayload).eql([]);
  await t.expect(personalizationPayload).eql([]);
  await t.expect(audiencesPayload).eql([]);
});
