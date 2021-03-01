import { t, ClientFunction } from "testcafe";
import generalConstants from "../../helpers/constants/general";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import addHtmlToHeader from "../../helpers/dom/addHtmlToHeader";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import testPageUrl from "../../helpers/constants/testPageUrl";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();

const TEST_ID = "C753470";

createFixture({
  title: `${TEST_ID}: A nonce attribute should be added to injected style tags when CSP nonce is available`,
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
                  style-src 'self' 'nonce-${nonce}';
                  connect-src 'self' *.alloyio.com *.demdex.net *.adobedc.net;`;
  document.head.appendChild(meta);
});

const testStyleApplied = ClientFunction(() => {
  const headerOpacity = window
    .getComputedStyle(document.querySelector("h1"))
    .getPropertyValue("opacity");
  return headerOpacity === "0.5";
});

test(`Test ${TEST_ID}: A nonce attribute should be added to injected style tags when CSP nonce is available`, async () => {
  const { nonce } = generalConstants;
  // Inject script tag with a nonce attribute so that alloy can use it.
  await addHtmlToHeader(`<script nonce="${nonce}"/>`);
  await injectContentSecurityPolicy(nonce);
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  // This event should result in Personalization component injecting a style tag
  await alloy.sendEvent({ renderDecisions: true });
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  // Verify that the returned style tag with nonce attr was injected by Personalization
  await t
    .expect(testStyleApplied())
    .ok(`Header style (opacity=0.5) was not applied`);
});
