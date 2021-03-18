import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import { TEST_PAGE_WITH_CSP as TEST_PAGE_WITH_CSP_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();

const TEST_ID = "C753469";

createFixture({
  title: `${TEST_ID}: A nonce attribute should be added to injected script tags when CSP nonce is available`,
  url: `${TEST_PAGE_WITH_CSP_URL}?test=${TEST_ID}`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: `${TEST_ID}`,
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const elementWithIdExist = ClientFunction(id => {
  return !!document.getElementById(id);
});

test(`Test ${TEST_ID}: A nonce attribute should be added to injected script tags when CSP nonce is available`, async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  const consoleLogger = await createConsoleLogger();
  // This event should result in Personalization component injecting a script tag
  await alloy.sendEvent({ renderDecisions: true });
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  // Verify that the returned script tag has been injected by Personalization
  await t
    .expect(elementWithIdExist(TEST_ID))
    .ok(`Could not find element with id ${TEST_ID}`);
  // Verify that the script tag with nonce attr was allowed to execute by the CSP
  await consoleLogger.log.expectMessageMatching(
    new RegExp(`${TEST_ID} SCRIPT INJECTION CSP NONCE TEST`)
  );
});
