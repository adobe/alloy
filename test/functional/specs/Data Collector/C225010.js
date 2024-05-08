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
import { t, Selector, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture/index.js";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody.js";
import createConsoleLogger from "../../helpers/consoleLogger/index.js";
import createUnhandledRejectionLogger from "../../helpers/createunhandledrejectionlogger.js";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled,
  clickCollectionEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { CONSENT_OUT } from "../../helpers/constants/consent.js";

createFixture({
  title: "C225010: Click collection handles errors when user declines consent",
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C225010: Click collection handles errors when user declines consent", async () => {
  const alloy = createAlloyProxy();
  const getLocation = ClientFunction(() => document.location.href.toString());
  const testConfig = compose(
    orgMainConfigMain,
    consentPending,
    debugEnabled,
    clickCollectionEnabled,
  );
  await alloy.configure(testConfig);
  await alloy.setConsent(CONSENT_OUT);

  await addHtmlToBody(`<a id="alloy-link-test" href="#foo">Test Link</a>`);

  const consoleLogger = await createConsoleLogger();
  const unhandledRejectionLogger = await createUnhandledRejectionLogger();
  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("#foo");
  await consoleLogger.warn.expectMessageMatching(
    /The click collection could not fully complete. The user declined consent./,
  );
  await unhandledRejectionLogger.expectNoMessageMatching(/.*/);
});
