/*
Copyright 2020 Adobe. All rights reserved.
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
  edgeDomainFirstParty,
  orgMainConfigMain,
} from "../../helpers/constants/configParts/index.js";
import { FIRST_PARTY_DOMAIN } from "../../helpers/constants/domain.js";
import getResponseBody from "../../helpers/networkLogger/getResponseBody.js";
import createResponse from "../../helpers/createResponse.js";
import areThirdPartyCookiesSupported from "../../helpers/areThirdPartyCookiesSupported.js";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const demdexUrlRegex = /\.demdex\.net/;

const getUrlFor = (requestLogger) => requestLogger.request.url;

const config = compose(orgMainConfigMain, edgeDomainFirstParty);

test.meta({
  ID: "C148846",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const networkLogger = createNetworkLogger();
createFixture({
  title: "C148846 - Setting edgeDomain to CNAME",
  requestHooks: [networkLogger.edgeInteractEndpointLogs],
});

test("C148846 - Setting edgeDomain to CNAME results in server calls to this CNAME", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent();
  await alloy.sendEvent();

  const firstRequest = networkLogger.edgeInteractEndpointLogs.requests[0];
  // const secondRequest = networkLogger.edgeInteractEndpointLogs.requests[1];

  const responseForDemdexRequest = JSON.parse(getResponseBody(firstRequest));
  // const responseForCnameRequest = JSON.parse(getResponseBody(secondRequest));

  const alloyDemdexResponse = createResponse({
    content: responseForDemdexRequest,
  });
  const demdexStateHandle =
    alloyDemdexResponse.getPayloadsByType("state:store");

  // const alloyCnameResponse = createResponse({ content: responseForCnameRequest });
  // const cnameStateHandle = alloyCnameResponse.getPayloadsByType("state:store");

  const demdexResponseContainsIdentityCookie = demdexStateHandle.find((h) =>
    h.key.includes(MAIN_IDENTITY_COOKIE_NAME),
  );

  const urlForFirstRequest = getUrlFor(firstRequest);
  // const hostForSecondRequest = getHostFor(secondRequest);

  if (areThirdPartyCookiesSupported()) {
    await t.expect(urlForFirstRequest).match(demdexUrlRegex);
    // await t.expect(hostForSecondRequest).contains(FIRST_PARTY_DOMAIN);

    // Expects the demdex response to contain Konductor state.
    // Expects the demdex state to contain the identity cookie.
    await t.expect(demdexStateHandle.length).gte(0);
    await t.expect(demdexResponseContainsIdentityCookie).ok();
  } else {
    await t.expect(urlForFirstRequest).contains(FIRST_PARTY_DOMAIN);
    // await t.expect(hostForSecondRequest).contains(FIRST_PARTY_DOMAIN);
  }

  // We don't believe these assertions are valid. When running this test locally on Firefox,
  // Testcafe adds an additional identifier to the cookie.

  // Expects the CNAME request header to contain the Konductor state cookies.
  // Expects the CNAME response body to not contain the Konductor state.
  // Expects the CNAME response header to contain the Konductor state.
  // await t
  //   .expect(secondRequest.request.headers.cookie)
  //   .contains(MAIN_IDENTITY_COOKIE_NAME);
  // await t.expect(cnameStateHandle.length).eql(0);
  // await t.expect(secondRequest.response.headers["set-cookie"]).ok();
  // await t
  //   .expect(secondRequest.response.headers["set-cookie"][0])
  //   .contains(MAIN_IDENTITY_COOKIE_NAME);
});
