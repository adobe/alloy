import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const mainConfig = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1338399: Use SDK from NPM entry point",
  includeAlloyLibrary: false,
  includeNpmLibrary: true,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

const createAlloyInstance = ClientFunction(() => {
  window.npmLibraryAlloy = window.alloyCreateInstance({
    instanceName: "npmLibraryAlloy"
  });
});

test.meta({
  ID: "C1338399: Use SDK from NPM entry point",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const alloyEnv = process.env.ALLOY_ENV || "int";

if (alloyEnv === "int") {
  test("C1338399: Use SDK from NPM entry point", async () => {
    await createAlloyInstance();
    const alloy = createAlloyProxy("npmLibraryAlloy");
    await alloy.configure(mainConfig);
    await alloy.sendEvent();
    await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  });
} else {
  test.skip("C1338399: Use SDK from NPM entry point", () => {});
}
