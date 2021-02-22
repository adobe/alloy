import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();

createFixture({
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
  const xdmDataLayer = { device: { screenHeight: 1 } };
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
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  const { xdmDataLayer, nonXdmDataLayer } = await sendEvent();
  await t.expect(xdmDataLayer).eql({ device: { screenHeight: 1 } });
  await t.expect(nonXdmDataLayer).eql({ baz: "quux" });
});
