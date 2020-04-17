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
  edgeDomainThirdParty,
  edgeDomainFirstParty,
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  thirdPartyCookiesEnabled,
  migrationEnabled,
  migrationDisabled
} from "../helpers/constants/configParts";
import reloadPage from "../helpers/reloadPage";
import setLegacyIdentityCookie from "../helpers/setLegacyIdentityCookie";

const networkLogger = createNetworkLogger();

const executeEventCommand = ClientFunction(() => {
  return window.alloy("event");
});

const demdexHostRegex = /\.demdex\.net/;

const getHostForFirstRequest = () => {
  const firstRequest = networkLogger.edgeInteractEndpointLogs.requests[0];
  return firstRequest.request.headers.host;
};

const assertRequestWentToDemdex = async () => {
  await t.expect(getHostForFirstRequest()).match(demdexHostRegex);
};

const assertRequestDidNotGoToDemdex = async () => {
  await t.expect(getHostForFirstRequest()).notMatch(demdexHostRegex);
};

// The names here match those listed in
// https://github.com/lancedikson/bowser/blob/9ecf3e94c3269ef8bb4c8274dab6a31eea665aea/src/constants.js
// which is the library that provides the value for t.browser.name.
const browsersSupportingThirdPartyCookiesByDefault = [
  "Chrome",
  "Chromium",
  "Microsoft Edge",
  "Internet Explorer"
];

const areThirdPartyCookiesSupportedByBrowserByDefault = () =>
  browsersSupportingThirdPartyCookiesByDefault.indexOf(t.browser.name) !== -1;

fixtureFactory({
  title: "C10922 - demdex usage",
  requestHooks: [networkLogger.edgeInteractEndpointLogs]
});

fixture.beforeEach(async () => {
  await setLegacyIdentityCookie(orgMainConfigMain.orgId);
});

test.meta({
  ID: "C10922",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const permutationsUsingDemdex = [
  {
    description: "third-party cookies enabled",
    config: compose(
      orgMainConfigMain,
      thirdPartyCookiesEnabled,
      edgeDomainThirdParty,
      migrationDisabled
    )
  },
  {
    description: "third-party cookies enabled and first-party edge domain",
    config: compose(
      orgMainConfigMain,
      thirdPartyCookiesEnabled,
      edgeDomainFirstParty,
      migrationDisabled
    )
  },
  {
    // If we have a identity to migrate, we still want to hit demdex because
    // demdex will use our ECID to set the third-party cookie if the third-party
    // cookie isn't already set, which provides for better cross-domain
    // identification for future requests.
    description:
      "third-party cookies enabled and migration enabled with existing legacy identity cookie",
    config: compose(
      orgMainConfigMain,
      thirdPartyCookiesEnabled,
      edgeDomainThirdParty,
      migrationEnabled
    )
  }
];

permutationsUsingDemdex.forEach(permutation => {
  test(`C10922 - demdex is used for first request when configured with ${permutation.description} and browser supports third-party cookies by default`, async () => {
    await configureAlloyInstance("alloy", permutation.config);
    await executeEventCommand();
    if (areThirdPartyCookiesSupportedByBrowserByDefault()) {
      await assertRequestWentToDemdex();
    } else {
      await assertRequestDidNotGoToDemdex();
    }
    await networkLogger.clearLogs();
    await reloadPage();
    await configureAlloyInstance("alloy", permutation.config);
    await executeEventCommand();
    // The request should not have gone to the third-party domain
    // because we already have an identity cookie.
    await assertRequestDidNotGoToDemdex();
  });
});

const permutationsNotUsingDemdex = [
  {
    description: "third-party cookies disabled",
    config: compose(
      orgMainConfigMain,
      thirdPartyCookiesDisabled,
      edgeDomainThirdParty,
      migrationDisabled
    )
  },
  {
    description: "third-party cookies disabled and first-party edge domain",
    config: compose(
      orgMainConfigMain,
      thirdPartyCookiesDisabled,
      edgeDomainFirstParty,
      migrationDisabled
    )
  },
  {
    description:
      "third-party cookies disabled and migration enabled with existing legacy identity cookie",
    config: compose(
      orgMainConfigMain,
      thirdPartyCookiesDisabled,
      edgeDomainFirstParty,
      migrationEnabled
    )
  }
];

permutationsNotUsingDemdex.forEach(permutation => {
  test(`C10922 - demdex is not used when configured with ${permutation.description}`, async () => {
    await configureAlloyInstance("alloy", permutation.config);
    await executeEventCommand();
    await assertRequestDidNotGoToDemdex();
  });
});
