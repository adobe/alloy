import { Selector } from "testcafe";
import createConsoleLogger from "../../helpers/consoleLogger";
import fixtureFactory from "../../helpers/fixtureFactory";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

fixtureFactory({
  title: "C2584: Toggle logging through debug command",
  url: urlCollector
});

test.meta({
  ID: "C2584",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2584: debug command with enable: true. getLibraryInfo. refresh. toggle and repeat.", async t => {
  const logger = createConsoleLogger(t, "log");
  await t
    .click(Selector("#nologconfig-button"))
    .click(Selector("#debugtrue-button"))
    .click(Selector("#getlibraryinfo-button"));

  let newMessages = await logger.getNewMessages();
  await t.expect(newMessages).match(/Executing getLibraryInfo command/);

  await t
    .navigateTo(
      "http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html"
    )
    .click(Selector("#nologconfig-button"))
    .click(Selector("#getlibraryinfo-button"));

  newMessages = await logger.getNewMessages();
  await t
    .expect(newMessages)
    .match(/\[alloy] Executing getLibraryInfo command./);

  await t
    .click(Selector("#debugfalse-button"))
    .click(Selector("#getlibraryinfo-button"));

  newMessages = await logger.getNewMessages();
  await t
    .expect(newMessages)
    .notMatch(/\[alloy] Executing getLibraryInfo command./);

  await t
    .navigateTo(
      "http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html"
    )
    .click(Selector("#nologconfig-button"))
    .click(Selector("#getlibraryinfo-button"));

  newMessages = await logger.getNewMessages();
  await t
    .expect(newMessages)
    .notMatch(/\[alloy] Executing getLibraryInfo command./);
});
