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
import createFixture from "../../helpers/createFixture/index.js";
import createConsoleLogger from "../../helpers/consoleLogger/index.js";
import { CONSENT_OUT } from "../../helpers/constants/consent.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import reloadPage from "../../helpers/reloadPage.js";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C14409 - Consenting to no purposes should be persisted.",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C14409",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const config = {
  datastreamId: "9999999",
  orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
  defaultConsent: "pending",
  idMigrationEnabled: false,
  debugEnabled: true,
};

test("C14409 - Consenting to no purposes should be persisted.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);
  // Reload page and reconfigure alloy
  // [TODO] Navigate to a different subdomain when it is available
  // https://github.com/DevExpress/testcafe/blob/a4f6a4ac3627ebeb29b344ed3a1793627dd87909/docs/articles/documentation/test-api/actions/navigate.md
  await reloadPage();

  await alloy.configure(config);
  const logger = await createConsoleLogger();
  await alloy.sendEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
