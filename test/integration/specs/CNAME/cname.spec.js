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
import { MAIN_IDENTITY_COOKIE_NAME } from "../../../functional/helpers/constants/cookies.js";
import {
  demdexHandler,
  firstPartyAlloyHandler,
} from "../../helpers/mswjs/handlers.js";

const demdexUrlRegex = /\.demdex\.net/;
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

describe("Setting edgeDomain to CNAME", () => {
  test("results in server calls made to this CNAME", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    await deleteCookies();

    worker.use(...[demdexHandler, firstPartyAlloyHandler]);

    alloy("configure", {
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
    expect(networkRecorder.calls.length).toBe(1);
  });
});
