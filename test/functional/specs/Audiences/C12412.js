import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createConsoleLogger from "../../helpers/consoleLogger";

const networkLogger = createNetworkLogger();
createFixture({
  title:
    "C12412 Response should return Cookie destinations if turned on in Blackbird",
  requestHooks: [networkLogger.edgeEndpointLogs]
});
test.meta({
  ID: "C12412",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getDocumentCookie = ClientFunction(() => document.cookie);

test("C12412 Response should return Cookie destinations if turned on in Blackbird", async () => {
  const logger = await createConsoleLogger();
  const alloy = createAlloyProxy();
  await alloy.configure(compose(orgMainConfigMain, debugEnabled));
  await alloy.sendEvent();

  await t.expect(getDocumentCookie()).contains("C12412=test=C12412");

  const logs = await logger.info.getMessagesSinceReset();
  const setCookieAttributes = logs
    .filter(message => message.length === 3 && message[1] === "Setting cookie")
    .map(message => message[2])
    .filter(cookieSettings => cookieSettings.name === "C12412");
  await t.expect(setCookieAttributes.length).eql(1);
  await t.expect(setCookieAttributes[0].sameSite).eql("none");
  await t.expect(setCookieAttributes[0].secure).eql(true);
});
