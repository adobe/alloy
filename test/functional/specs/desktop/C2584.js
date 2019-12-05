import { Selector } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

fixture`C2584: Toggle logging through debug command`.page(urlCollector);

test.meta({
  ID: "C2584",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: debug command with enable: true. getLibraryInfo. refresh. toggle and repeat.", async t => {
  await t
    .click(Selector("#nologconfig-button"))
    .click(Selector("#debugtrue-button"))
    .click(Selector("#getlibraryinfo-button"));

  let log = await t.getBrowserConsoleMessages();
  await t.expect(log.log).match(/Executing getLibraryInfo command/);
  let discard = log.log.length;

  await t
    .navigateTo(
      "http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html"
    )
    .click(Selector("#nologconfig-button"))
    .click(Selector("#getlibraryinfo-button"));

  log = await t.getBrowserConsoleMessages();
  await t
    .expect(log.log.slice(discard))
    .match(/\[alloy] Executing getLibraryInfo command./);
  discard = log.log.length;

  await t
    .click(Selector("#debugfalse-button"))
    .click(Selector("#getlibraryinfo-button"));

  log = await t.getBrowserConsoleMessages();
  await t
    .expect(log.log.slice(discard))
    .notMatch(/\[alloy] Executing getLibraryInfo command./);
  discard = log.log.length;

  await t
    .navigateTo(
      "http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html"
    )
    .click(Selector("#nologconfig-button"))
    .click(Selector("#getlibraryinfo-button"));

  log = await t.getBrowserConsoleMessages();
  await t
    .expect(log.log.slice(discard))
    .notMatch(/\[alloy] Executing getLibraryInfo command./);
});
