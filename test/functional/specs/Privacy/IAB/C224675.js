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
import createNetworkLogger from "../../../helpers/networkLogger";
import createFixture from "../../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../../helpers/constants/configParts";
import createAlloyProxy from "../../../helpers/createAlloyProxy";

const config = compose(orgMainConfigMain, consentPending, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C224675: Passing invalid consent options should throw a validation error.",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeEndpointLogs
  ]
});

test.meta({
  ID: "C224675",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

test("Test C224675: Passing invalid consent options should throw a validation error", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const errorMessageForInvalidStandard = await alloy.setConsentErrorMessage({
    consent: [
      {
        standard: "IAB",
        version: "2.0",
        value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA"
      }
    ]
  });

  await t
    .expect(errorMessageForInvalidStandard)
    .ok("Expected the setConsent command to be rejected");

  await t
    .expect(errorMessageForInvalidStandard)
    .contains("The server responded with a status code 400")
    .expect(errorMessageForInvalidStandard)
    .contains("EXEG-0102-400");

  const errorMessageForInvalidVersion = await alloy.setConsentErrorMessage({
    consent: [
      {
        standard: "IAB TCF",
        version: "6.9",
        value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA"
      }
    ]
  });

  await t
    .expect(errorMessageForInvalidVersion)
    .ok("Expected the setConsent command to be rejected");

  await t
    .expect(errorMessageForInvalidVersion)
    .contains("The server responded with a status code 400")
    .expect(errorMessageForInvalidVersion)
    .contains("EXEG-0102-400");

  const errorMessageForInvalidValue = await alloy.setConsentErrorMessage({
    consent: [
      {
        standard: "IAB TCF",
        version: "2.0"
      }
    ]
  });

  await t
    .expect(errorMessageForInvalidValue)
    .ok("Expected the setConsent command to be rejected");

  await t
    .expect(errorMessageForInvalidValue)
    .contains("The server responded with a status code 400")
    .expect(errorMessageForInvalidValue)
    .contains("EXEG-0103-400");

  const errorMessageForEmptyValue = await alloy.setConsentErrorMessage({
    consent: [
      {
        standard: "IAB TCF",
        version: "2.0",
        value: ""
      }
    ]
  });

  await t
    .expect(errorMessageForEmptyValue)
    .ok("Expected the setConsent command to be rejected");

  await t
    .expect(errorMessageForEmptyValue)
    .contains("The server responded with a status code 422")
    .expect(errorMessageForEmptyValue)
    .contains("EXEG-0104-422");
});
