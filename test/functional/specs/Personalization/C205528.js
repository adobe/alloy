import { t, RequestLogger } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import { responseStatus } from "../../helpers/assertions";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";

const networkLogger = createNetworkLogger();

const redirectLogger = RequestLogger(
  "https://alloyio.com/functional-test/alloyTestPage.html?redirectedTest=true&test=C205528"
);

createFixture({
  title:
    "C205528 A redirect offer should redirect the page to the URL in the redirect decision",
  url: `${TEST_PAGE_URL}?test=C205528`,
  requestHooks: [networkLogger.edgeEndpointLogs, redirectLogger]
});

test.meta({
  ID: "C205528",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});
const assertRedirectNotificationType = async notificationEvents => {
  await t.expect(notificationEvents[0].xdm.eventType).eql("redirect");
};

const assertScopeDetails = async (decision, notificationEvents) => {
  // eslint-disable-next-line no-underscore-dangle
  const meta = notificationEvents[0].xdm._experience.decisioning.propositions;
  await t.expect(meta[0].scopeDetails).eql(decision.scopeDetails);
};

const getDecisions = () => {
  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );
  return createResponse({
    content: response
  }).getPayloadsByType("personalization:decisions");
};

test("Test C205528: A redirect offer should redirect the page to the URL in the redirect decision", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);

  await alloy.sendEvent({ renderDecisions: true });
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const decisions = getDecisions(networkLogger);
  const redirectNotification = networkLogger.edgeEndpointLogs.requests[1];

  const redirectNotificationBody = JSON.parse(
    redirectNotification.request.body
  );
  const notificationEvents = redirectNotificationBody.events;

  // expect the redirect notification is sent
  await assertRedirectNotificationType(notificationEvents);
  await assertScopeDetails(decisions[0], notificationEvents);

  // expect the redirect was executed
  await t.expect(redirectLogger.requests.length).eql(1);
});
