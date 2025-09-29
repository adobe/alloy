/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
// test/functional/specs/Data Collector/C81184.js
/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture/index.js";
import createConsoleLogger from "../../helpers/consoleLogger/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody.js";

const alloyMonitorScript = `
window.__alloyMonitors = window.__alloyMonitors || [];
window.__alloyMonitors.push({ 
    onInstanceConfigured: function(data) {   
        window.___getLinkDetails = data.getLinkDetails;
    }
});`;

createFixture({
  title: "C81184: Validate click collection configuration warnings",
  monitoringHooksScript: alloyMonitorScript,
});

test.meta({
  ID: "C81184",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C81184: Warns when click collection features configured but disabled", async () => {
  const consoleLogger = await createConsoleLogger();
  const alloy = createAlloyProxy();

  await alloy.configure(
    compose(orgMainConfigMain, debugEnabled, {
      clickCollectionEnabled: false,
      onBeforeLinkClickSend: () => {},
      downloadLinkQualifier: "\\.pdf$",
    }),
  );

  await consoleLogger.warn.expectMessageMatching(
    /The 'onBeforeLinkClickSend' configuration was provided but will be ignored because clickCollectionEnabled is false/,
  );

  await consoleLogger.warn.expectMessageMatching(
    /The 'downloadLinkQualifier' configuration was provided but will be ignored because clickCollectionEnabled is false/,
  );
});

test("Test C81184: Does not warn for default downloadLinkQualifier when disabled", async () => {
  const consoleLogger = await createConsoleLogger();
  const alloy = createAlloyProxy();

  await alloy.configure(
    compose(orgMainConfigMain, debugEnabled, {
      clickCollectionEnabled: false,
    }),
  );

  await consoleLogger.warn.expectNoMessageMatching(
    /The 'downloadLinkQualifier' configuration was provided/,
  );
});

test("Test C81184: Does not warn when clickCollectionEnabled is true", async () => {
  const consoleLogger = await createConsoleLogger();
  const alloy = createAlloyProxy();

  await alloy.configure(
    compose(orgMainConfigMain, debugEnabled, {
      clickCollectionEnabled: true,
      onBeforeLinkClickSend: () => {},
      downloadLinkQualifier: "\\.pdf$",
    }),
  );

  await consoleLogger.warn.expectNoMessageMatching(
    /The 'onBeforeLinkClickSend' configuration was provided/,
  );

  await consoleLogger.warn.expectNoMessageMatching(
    /The 'downloadLinkQualifier' configuration was provided/,
  );
});

const getLinkDetails = ClientFunction((selector) => {
  const linkElement = document.getElementById(selector);
  // eslint-disable-next-line no-underscore-dangle
  const result = window.___getLinkDetails(linkElement);
  if (!result) {
    return result;
  }
  return {
    pageName: result.pageName,
    linkName: result.linkName,
    linkRegion: result.linkRegion,
    linkType: result.linkType,
    linkUrl: result.linkUrl,
  };
});

test("Test C81184: getLinkDetails works regardless of clickCollectionEnabled", async () => {
  const alloy = createAlloyProxy();

  await alloy.configure(
    compose(orgMainConfigMain, debugEnabled, {
      clickCollectionEnabled: false,
    }),
  );

  await addHtmlToBody(
    '<a href="https://example.com" id="test-link">Test Link</a>',
  );

  const result = await getLinkDetails("test-link");

  await t.expect(result).notEql(undefined);
  await t.expect(result.linkName).eql("Test Link");
  await t.expect(result.linkUrl).contains("example.com");
  await t.expect(result.linkType).eql("exit");
});
