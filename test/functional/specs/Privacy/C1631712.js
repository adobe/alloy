import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { CONSENT_IN } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";
import flushPromiseChains from "../../../unit/helpers/flushPromiseChains";
import createConsoleLogger from "../../helpers/consoleLogger";

const config = compose(
  orgMainConfigMain,
  { defaultConsent: "out" },
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1631712: Requests are dropped when default consent is out",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C1631712",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C1631712: Requests are dropped when default consent is out", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const logger = await createConsoleLogger();

  const result = await alloy.sendEvent();
  await t.expect(result).eql({});
  await logger.warn.expectMessageMatching(
    /No consent preferences have been set./
  );

  await alloy.setConsent(CONSENT_IN);
  await flushPromiseChains();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
