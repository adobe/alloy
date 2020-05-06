import { t, ClientFunction } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import debugEnabledConfig from "../helpers/constants/debugEnabledConfig";
import createConsoleLogger from "../helpers/consoleLogger";

const fs = require("fs");

fixtureFactory({
  title: "C2580: Command queueing test",
  includeAlloyLibrary: false
});

test.meta({
  ID: "C2580",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const environmentSupportsInjectingAlloy = () => {
  const env = process.env.EDGE_ENV || "int";
  return env === "int";
};

const configureAlloy = ClientFunction(cfg => {
  window.alloy("configure", cfg);
});

const getLibraryInfoCommand = ClientFunction(() => {
  window.alloy("getLibraryInfo");
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
  const logger = createConsoleLogger(t, "log");
  await injectScript(alloyLibrary);
  const newMessages = await logger.getNewMessages();
  await t.expect(newMessages).match(/Executing getLibraryInfo command/);
});
