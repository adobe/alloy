import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { injectInlineScript } from "../../helpers/createFixture/clientScripts";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);
const PAGE_WIDE_SCOPE = "__view__";

createFixture({
  title: "C28758 A VEC offer with ShadowDOM selectors should render",
  url: `${TEST_PAGE_URL}?test=C28758`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C28758",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const shadowDomScript = `
    const buyNowContent = \`
    <div>
      <input type="radio" id="buy" name="buy_btn" value="Buy NOW">
      <label for="buy">Buy Now</label><br>
      <div>
        <input type="radio" id="buy_later" name="buy_btn_ltr" value="Buy LATER">
        <label for="buy_later">Buy Later</label><br>
      </div>
    </div>
  \`;
    customElements.define(
      "buy-now-button",
      class extends HTMLElement {
        constructor() {
          super();

          const shadowRoot = this.attachShadow({ mode: "open" });
          shadowRoot.innerHTML = buyNowContent;
        }
      }
    );

    const productOrderContent = \`<div><p>Product order</p><buy-now-button>Buy</buy-now-button></div>\`;
    customElements.define(
      "product-order",
      class extends HTMLElement {
        constructor() {
          super();

          const shadowRoot = this.attachShadow({ mode: "open" });
          shadowRoot.innerHTML = productOrderContent;
        }
      }
    );
`;

const shadowDomFixture = `
  <form id="form" action="https://www.adobe.com" method="post">
    <buy-now-button>FirstButton</buy-now-button>
    <buy-now-button>SecondButton</buy-now-button>
    <product-order>FirstOrder</product-order>
    <product-order>SecondOrder</product-order>
    <input type="submit" value="Submit"/>
  </form>
  `;

const getSimpleShadowLabelText = ClientFunction(() => {
  const form = document.getElementById("form");
  const simpleShadowLabel = form.children[1].shadowRoot.children[0].getElementsByTagName(
    "label"
  )[1];

  return simpleShadowLabel.innerText;
});

const getNestedShadowLabelText = ClientFunction(() => {
  const form = document.getElementById("form");
  const nestedShadowLabel = form.children[3].shadowRoot
    .querySelector("buy-now-button")
    .shadowRoot.children[0].getElementsByTagName("label")[0];

  return nestedShadowLabel.innerText;
});

test("Test C28758: A VEC offer with ShadowDOM selectors should render", async () => {
  await injectInlineScript(shadowDomScript);
  await addHtmlToBody(shadowDomFixture);

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const eventResult = await alloy.sendEvent({ renderDecisions: true });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);

  await t
    .expect(requestBody.events[0].query.personalization.decisionScopes)
    .eql([PAGE_WIDE_SCOPE]);

  const personalizationSchemas =
    requestBody.events[0].query.personalization.schemas;

  const result = [
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/html-content-item",
    "https://ns.adobe.com/personalization/json-content-item",
    "https://ns.adobe.com/personalization/redirect-item"
  ].every(schema => personalizationSchemas.includes(schema));

  await t.expect(result).eql(true);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  const personalizationPayload = createResponse({
    content: response
  }).getPayloadsByType("personalization:decisions");

  await t.expect(personalizationPayload[0].scope).eql(PAGE_WIDE_SCOPE);

  await t.expect(getSimpleShadowLabelText()).eql("Simple Shadow offer!");
  await t.expect(getNestedShadowLabelText()).eql("Nested Shadow offer!");

  await t.expect(eventResult.decisions).eql([]);
  await t.expect(eventResult.propositions[0].renderAttempted).eql(true);
});
