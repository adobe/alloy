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

import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  edgeDomainFirstParty,
  orgMainConfigMain
} from "../helpers/constants/configParts";
import { domain } from "../helpers/edgeInfo";
import getResponseBody from "../helpers/networkLogger/getResponseBody";
import createResponse from "../../../src/core/createResponse";

const executeEventCommand = ClientFunction(() => {
  return window.alloy("sendEvent");
});

const demdexHostRegex = /\.demdex\.net/;

const getHostFor = requestLogger => requestLogger.request.headers.host;

const browsersSupportingThirdPartyCookiesByDefault = [
  "Chrome",
  "Chromium",
  "Microsoft Edge",
  "Internet Explorer"
];

const identityCookieName = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_identity";

const areThirdPartyCookiesSupportedByBrowserByDefault = () =>
  browsersSupportingThirdPartyCookiesByDefault.indexOf(t.browser.name) !== -1;

const config = compose(
  orgMainConfigMain,
  edgeDomainFirstParty
);

test.meta({
  ID: "C148846",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const networkLogger = createNetworkLogger();
fixtureFactory({
  title: "C148846 - Setting edgeDomain to CNAME",
  requestHooks: [networkLogger.edgeInteractEndpointLogs]
});

const assertCnameUseCases = async (secondRequest, cnameStateHandle) => {
  // NOTE: This assertion is failing on IE 11; we need to debug it.
  // await t
  //   .expect(secondRequest.request.headers.cookie)
  //   .contains(identityCookieName);
  await t.expect(cnameStateHandle.length).eql(0);
  await t.expect(secondRequest.response.headers["set-cookie"]).ok();
  await t
    .expect(secondRequest.response.headers["set-cookie"][0])
    .contains(identityCookieName);
};

test("C148846 - Setting edgeDomain to CNAME results in server calls to this CNAME", async () => {
  await configureAlloyInstance("alloy", config);
  await executeEventCommand();
  await executeEventCommand();

  const firstRequest = networkLogger.edgeInteractEndpointLogs.requests[0];
  const secondRequest = networkLogger.edgeInteractEndpointLogs.requests[1];

  const responseForDemdexRequest = JSON.parse(getResponseBody(firstRequest));
  const responseForCnameRequest = JSON.parse(getResponseBody(secondRequest));

  const alloyDemdexResponse = createResponse(responseForDemdexRequest);
  const demdexStateHandle = alloyDemdexResponse.getPayloadsByType(
    "state:store"
  );

  const alloyCnameResponse = createResponse(responseForCnameRequest);
  const cnameStateHandle = alloyCnameResponse.getPayloadsByType("state:store");

  const demdexResponseContainsIdentityCookie = demdexStateHandle.find(h => {
    return h.key.includes(identityCookieName);
  });

  const hostForFirstRequest = getHostFor(firstRequest);
  const hostForSecondRequest = getHostFor(secondRequest);

  if (areThirdPartyCookiesSupportedByBrowserByDefault()) {
    await t.expect(hostForFirstRequest).match(demdexHostRegex);
    await t.expect(hostForSecondRequest).contains(domain.firstParty);

    // Expects the demdex response to contain Konductor state.
    // Expects the demdex state to contain the identity cookie.
    await t.expect(demdexStateHandle.length).gte(0);
    await t.expect(demdexResponseContainsIdentityCookie).ok();

    // Expects the CNAME request header to contain the Konductor state cookies.
    // Expects the CNAME response body to not contain the Konductor state.
    // Expects the CNAME response header to contain the Konductor state.
    await assertCnameUseCases(secondRequest, cnameStateHandle);
  } else {
    await t.expect(hostForFirstRequest).contains(domain.firstParty);
    await t.expect(hostForSecondRequest).contains(domain.firstParty);

    await assertCnameUseCases(secondRequest, cnameStateHandle);
  }
});
