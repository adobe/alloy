import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_OUT } from "../../helpers/constants/consent";
import reloadPage from "../../helpers/reloadPage";
import cookies from "../../helpers/cookies";
import { MAIN_CONSENT_COOKIE_NAME } from "../../helpers/constants/cookies";

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
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);
  // make sure this doesn't throw an error
  await alloy.setConsent(CONSENT_OUT);
});

test("Test C14411: User consents to no purposes after consenting to no purposes without cache", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);

  await reloadPage();
  await cookies.remove(MAIN_CONSENT_COOKIE_NAME);

  await alloy.configure(config);
  const setConsentErrorMessage = await alloy.setConsentErrorMessage(
    CONSENT_OUT
  );

  await t
    .expect(setConsentErrorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t.expect(setConsentErrorMessage).contains("EXEG-0302-409");
});
