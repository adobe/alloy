import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import { orgMainConfigMain } from "../helpers/constants/configParts";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title:
    "C75372 - XDM and data objects passed into event command should not be modified",
  requestHooks: [networkLogger.setConsentEndpointLogs]
});

test.meta({
  ID: "C75372",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEvent = ClientFunction(() => {
  const xdmDataLayer = { foo: "bar" };
  const nonXdmDataLayer = { baz: "quux" };
  // Using a merge ID is a decent test because it's one thing we know
  // gets merged with the XDM object.
  return window
    .alloy("sendEvent", {
      xdm: xdmDataLayer,
      data: nonXdmDataLayer,
      mergeId: "abc"
    })
    .then(() => {
      return {
        xdmDataLayer,
        nonXdmDataLayer
      };
    });
});

test("C75372 - XDM and data objects passed into event command should not be modified", async () => {
  await configureAlloyInstance("alloy", orgMainConfigMain);
  const { xdmDataLayer, nonXdmDataLayer } = await sendEvent();
  await t.expect(xdmDataLayer).eql({ foo: "bar" });
  await t.expect(nonXdmDataLayer).eql({ baz: "quux" });
});
