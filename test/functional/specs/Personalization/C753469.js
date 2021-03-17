/*
import { t, ClientFunction } from "testcafe";
import generalConstants from "../../helpers/constants/general";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";
import addHtmlToHeader from "../../helpers/dom/addHtmlToHeader";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import testPageUrl from "../../helpers/constants/testPageUrl";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();

const TEST_ID = "C753469";

createFixture({
  title: `${TEST_ID}: A nonce attribute should be added to injected script tags when CSP nonce is available`,
  url: `${testPageUrl}?test=${TEST_ID}`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: `${TEST_ID}`,
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const injectContentSecurityPolicy = ClientFunction(nonce => {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = `default-src 'self';
                  script-src 'self' 'unsafe-eval' 'nonce-${nonce}';
                  style-src 'self' 'nonce-${nonce}'`;
  document.head.appendChild(meta);
});

const elementWithIdExist = ClientFunction(id => {
  return !!document.getElementById(id);
});

test.skip(`Test ${TEST_ID}: A nonce attribute should be added to injected script tags when CSP nonce is available`, async () => {
  const { nonce } = generalConstants;
  // Inject script tag with a nonce attribute so that alloy can use it.
  await addHtmlToHeader(`<script nonce="${nonce}"/>`);
  await injectContentSecurityPolicy(nonce);
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
*/
