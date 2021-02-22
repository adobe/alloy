import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

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
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.sendEvent();

  await t.expect(getDocumentCookie()).contains("C12412=test=C12412");
});
