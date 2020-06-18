import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";

import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

const fs = require("fs");

createFixture({
  title: "C2580: Command queueing test",
  includeAlloyLibrary: false
});

test.meta({
  ID: "C2580",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const environmentSupportsInjectingAlloy = () =>
  (process.env.ALLOY_ENV || "int") === "int";

const getLibraryInfoCommand = ClientFunction(() => {
  window.alloy("getLibraryInfo");
});

const configureAlloy = ClientFunction(cfg => {
  window.alloy("configure", cfg);
});

const getAlloyCommandQueueLength = ClientFunction(() => {
  return window.alloy.q.length;
});

const injectScript = ClientFunction(script => {
  const scriptElement = document.createElement("script");
  scriptElement.type = "text/javascript";
  scriptElement.innerHTML = script;
  document.getElementsByTagName("head")[0].appendChild(scriptElement);
});

test("C2580: Command queueing test.", async () => {
  if (!environmentSupportsInjectingAlloy()) {
    return;
  }
  await configureAlloy(debugEnabledConfig);
  await getLibraryInfoCommand();
  await t.expect(getAlloyCommandQueueLength()).eql(2);
  const alloyLibrary = fs.readFileSync("dist/standalone/alloy.js", "utf-8");
  const logger = await createConsoleLogger();
  await injectScript(alloyLibrary);
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);
});
