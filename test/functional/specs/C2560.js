import { ClientFunction } from "testcafe";
import Page from "../helpers/page-model";

const page = new Page();

const urlCollector = "https://alloyqe.azurewebsites.net/";

fixture`test`.page(urlCollector).requestHooks(page.edgeGateway, page.alloyQe);

test("C2560 - Install and test for global function named alloy.", async t => {
  await page.loggerContains(page.alloyQe, "https://alloyqe.azurewebsites.net/");
  await page.loggerContains(
    page.alloyQe,
    "https://alloyqe.azurewebsites.net/alloy.js"
  );
  await page.loggerContains(
    page.edgeGateway,
    "https://edgegateway.azurewebsites.net/"
  );

  const alloySdk = ClientFunction(() => {
    // eslint-disable-next-line no-underscore-dangle
    return window.__alloyNS[0];
  });

  await t.expect(await alloySdk()).contains("alloy");
});
