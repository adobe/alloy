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

  const errorMessageForInvalidStandard = await getErrorMessageFromSetConsent({
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
    .contains(
      "The value supplied for field 'consent[0]' does not match your input schema"
    );

  await t.expect(errorMessageForInvalidStandard).contains("EXEG-0102-400");

  const errorMessageForInvalidVersion = await getErrorMessageFromSetConsent({
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
    .contains(
      "The value supplied for field 'consent[0]' does not match your input schema"
    );

  await t.expect(errorMessageForInvalidVersion).contains("EXEG-0102-400");

  const errorMessageForInvalidValue = await getErrorMessageFromSetConsent({
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
    .contains(
      "Invalid request. No value supplied for field 'consent.[0].value'"
    );

  await t.expect(errorMessageForInvalidValue).contains("EXEG-0103-400");

  const errorMessageForEmptyValue = await getErrorMessageFromSetConsent({
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
    .contains(
      "IAB consent string value must not be empty for standard 'IAB TCF' at index 0"
    );

  await t.expect(errorMessageForEmptyValue).contains("EXEG-0104-422");
});
