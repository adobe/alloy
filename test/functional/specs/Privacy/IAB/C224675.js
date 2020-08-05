import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../../helpers/networkLogger";
import createFixture from "../../../helpers/createFixture";
import configureAlloyInstance from "../../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

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

const getErrorMessageFromSetConsent = ClientFunction(consent =>
  window.alloy("setConsent", consent).then(() => undefined, e => e.message)
);

test("Test C224675: Passing invalid consent options should throw a validation error", async () => {
  await configureAlloyInstance("alloy", config);

  const errorMessageForInvalidStandard = getErrorMessageFromSetConsent({
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
    .contains("The server responded with the following errors");

  await t
    .expect(errorMessageForInvalidStandard)
    .contains(
      "The value supplied for field 'standard' does not match your input schema"
    );

  const errorMessageForInvalidVersion = getErrorMessageFromSetConsent({
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
    .contains("The server responded with the following errors");

  // TODO: The error message below is not consistent with the way `standard` is being validated.
  // Discussed it with the Konductor team, they will re-work it.
  // https://jira.corp.adobe.com/browse/EXEG-1961
  await t
    .expect(errorMessageForInvalidVersion)
    .contains("Allowed IAB version is 2.0 for standard 'IAB TCF'");

  const errorMessageForInvalidValue = getErrorMessageFromSetConsent({
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
    .contains("The server responded with the following errors");

  // TODO: The error message below is not consistent with the way `standard` is being validated.
  // Discussed it with the Konductor team, they will re-work it.
  await t
    .expect(errorMessageForInvalidValue)
    .contains("[Code global:400] Invalid request.");

  const errorMessageForEmtpyValue = getErrorMessageFromSetConsent({
    consent: [
      {
        standard: "IAB TCF",
        version: "2.0",
        value: ""
      }
    ]
  });

  await t
    .expect(errorMessageForEmtpyValue)
    .ok("Expected the setConsent command to be rejected");

  await t
    .expect(errorMessageForEmtpyValue)
    .contains("The server responded with the following errors");

  // TODO: The error message below is not consistent with the way `standard` is being validated.
  // Discussed it with the Konductor team, they will re-work it.
  await t
    .expect(errorMessageForEmtpyValue)
    .contains(
      "IAB consent string value must not be empty for standard 'IAB TCF'"
    );
});
