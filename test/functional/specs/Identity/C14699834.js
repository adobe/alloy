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
import {
  compose,
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  debugEnabled,
  edgeDomainFirstParty
} from "../../helpers/constants/configParts";
import { TEST_PAGE } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createFixture from "../../helpers/createFixture";
import cookies from "../../helpers/cookies";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";
import { CONSENT_IN } from "../../helpers/constants/consent";

createFixture({
  url: TEST_PAGE,
  title: "C14699834: Identity is still established if first request fails"
});

test.meta({
  ID: "C9999999",
  SEVERTIY: "P0",
  TEST_RUN: "Regression"
});

const config = compose(
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  debugEnabled,
  edgeDomainFirstParty
);

test("C14699834: Identity is still established if the first send event fails", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const errorMessage = await alloy.sendEventErrorMessage({
    xdm: {
      identityMap: {
        ECID: [
          {
            id: "INVALID_ID"
          }
        ]
      }
    }
  });
  await t.expect(await errorMessage).contains("INVALID_ID");
  // make sure we don't have an ECID
  const identityCookieValue1 = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t
    .expect(identityCookieValue1)
    .notOk("Identity cookie found prematurely.");

  await alloy.sendEvent({});

  // make sure we have an ecid
  const identityCookieValue2 = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue2).ok("No identity cookie found.");
});

test("C14699834: Identity is still established if the first set consent fails", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const errorMessage = await alloy.setConsentErrorMessage({
    identityMap: {
      ECID: [
        {
          id: "INVALID_ID"
        }
      ]
    },
    ...CONSENT_IN
  });
  await t.expect(await errorMessage).contains("INVALID_ID");
  // make sure we don't have an ECID
  const identityCookieValue1 = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t
    .expect(identityCookieValue1)
    .notOk("Identity cookie found prematurely.");

  await alloy.setConsent(CONSENT_IN);

  // make sure we have an ecid
  const identityCookieValue2 = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue2).ok("No identity cookie found.");
});

test("C14699834: Identity is still established if the first get identity fails", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const errorMessage = await alloy.getIdentityErrorMessage({
    edgeConfigOverrides: { myinvalidoverride: "myvalue" }
  });
  await t.expect(await errorMessage).contains("myinvalidoverride");
  // make sure we don't have an ECID
  const identityCookieValue1 = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t
    .expect(identityCookieValue1)
    .notOk("Identity cookie found prematurely.");

  await alloy.getIdentity();

  // make sure we have an ecid
  const identityCookieValue2 = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue2).ok("No identity cookie found.");
});
