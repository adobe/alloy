import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { injectAlloyDuringTest } from "../../helpers/createFixture/clientScripts";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

createFixture({
  title: "C2580: Command queueing test",
  includeAlloyLibrary: false
});

test.meta({
  ID: "C2580",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getLibraryInfoCommand = ClientFunction(() => {
  window.alloy("getLibraryInfo");
});

const configureAlloy = ClientFunction(cfg => {
  window.alloy("configure", cfg);
});

const getAlloyCommandQueueLength = ClientFunction(() => {
  return window.alloy.q.length;
});

test.only("C2580: Command queueing test.", async () => {
  await configureAlloy(debugEnabledConfig);
  await getLibraryInfoCommand();
  await t.expect(getAlloyCommandQueueLength()).eql(2);
  const logger = await createConsoleLogger();
  await injectAlloyDuringTest();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);
});
