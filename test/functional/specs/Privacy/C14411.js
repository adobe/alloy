import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_OUT } from "../../helpers/constants/consent";

const config = compose(
  orgMainConfigMain,
  consentPending
);

createFixture({
  title: "C14411: User consents to no purposes after consenting to no purposes"
});

test.meta({
  ID: "C14411",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14411: User consents to no purposes after consenting to no purposes", async () => {
  const alloy = createAlloyProxy("alloy");
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);
  // make sure this doesn't throw an error
  await alloy.setConsent(CONSENT_OUT);
});
