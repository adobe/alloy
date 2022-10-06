import createConsoleLogger from "../../helpers/consoleLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import reloadPage from "../../helpers/reloadPage";
import createAlloyProxy from "../../helpers/createAlloyProxy";

createFixture({
  title: "C2584: Toggle logging through setDebug command"
});

test.meta({
  ID: "C2584",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C2584: setDebug command with enable: true. getLibraryInfo. refresh. toggle and repeat.", async () => {
  const logger = await createConsoleLogger();
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.setDebug({ enabled: true });
  await alloy.getLibraryInfo();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);

  await reloadPage();
  await alloy.configure(orgMainConfigMain);
  await alloy.setDebug({ enabled: false });
  await logger.reset();
  await alloy.getLibraryInfo();
  await logger.info.expectNoMessages();
});
