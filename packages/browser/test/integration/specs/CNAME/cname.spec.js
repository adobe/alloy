/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import alloyConfig from "../../helpers/alloy/config.js";
import { describe, test, expect } from "../../helpers/testsSetup/extend.js";
import deleteCookies from "../../helpers/utils/deleteCookies.js";
import createResponse from "../../helpers/responses/createResponse.js";
import { FIRST_PARTY_DOMAIN } from "../../helpers/constants/domains.js";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies.js";
import {
  demdexHandler,
  firstPartyAlloyHandler,
} from "../../helpers/mswjs/handlers.js";

// Only the Edge interact call carries the identity cookie; other demdex
// traffic (e.g. Visitor.js ID syncs) must not be matched.
const demdexUrlRegex = /^https:\/\/adobedc\.demdex\.net\/ee\/.*v1\/interact/;
const getIdentityCookie = (call) => {
  const response = createResponse({
    content: call.response.body,
  });

  const handle = response.getPayloadsByType("state:store");
  const identityCookie = handle.find((h) =>
    h.key.includes(MAIN_IDENTITY_COOKIE_NAME),
  );

  return identityCookie;
};

// Only Chromium's third-party-cookie-supported path is covered; the browser-default-unsupported path is not.
describe("Setting edgeDomain to CNAME", () => {
  test("C148846: results in server calls made to this CNAME", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    await deleteCookies();

    worker.use(...[demdexHandler, firstPartyAlloyHandler]);

    await alloy("configure", {
      ...alloyConfig,
      edgeDomain: FIRST_PARTY_DOMAIN,
      thirdPartyCookiesEnabled: true,
    });

    await alloy("sendEvent");

    const demdexCall = await networkRecorder.findCall(demdexUrlRegex);
    expect(getIdentityCookie(demdexCall)).toBeDefined();

    networkRecorder.reset();

    await alloy("sendEvent");

    expect(await networkRecorder.findCall(FIRST_PARTY_DOMAIN)).toBeDefined();
    const edgeCalls = networkRecorder.calls.filter((call) =>
      /\/ee\/.*v1\/interact/.test(call.url),
    );
    expect(edgeCalls).toHaveLength(1);
  });

  // Live Edge and the real CNAME are required to verify first-party routing.
  test("C148846: live Edge routes through the first-party CNAME", async ({
    alloy,
    networkRecorder,
  }) => {
    await alloy("configure", {
      orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
      datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
      edgeDomain: FIRST_PARTY_DOMAIN,
      edgeBasePath: "ee-pre-prd",
      thirdPartyCookiesEnabled: true,
    });
    await alloy("sendEvent");
    await alloy("sendEvent");

    const calls = await networkRecorder.findCalls(
      /\/ee-pre-prd\/.*v1\/interact/,
      { minCalls: 2 },
    );
    expect(calls).toHaveLength(2);
    expect(calls[0].request.url).toMatch(
      /^https:\/\/adobedc\.demdex\.net\/ee-pre-prd\/v1\/interact/,
    );
    expect(getIdentityCookie(calls[0])).toBeDefined();
    expect(calls[1].request.url).toContain(FIRST_PARTY_DOMAIN);
  });
});
