import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { injectAlloyDuringTest } from "../../helpers/createFixture/clientScripts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const debugEnabledConfig = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C2580: Command queueing test",
  includeAlloyLibrary: false
});

test.meta({
  ID: "C2580",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getAlloyCommandQueueLength = ClientFunction(() => {
  return window.alloy.q.length;
});

test("C2580: Command queueing test.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configureAsync(debugEnabledConfig);
  await alloy.getLibraryInfoAsync();
  await t.expect(getAlloyCommandQueueLength()).eql(2);
  const logger = await createConsoleLogger();
  await injectAlloyDuringTest();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);
});
