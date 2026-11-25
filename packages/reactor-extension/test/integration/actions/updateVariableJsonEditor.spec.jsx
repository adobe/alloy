/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, beforeEach, afterEach } from "vitest";
import useView from "../helpers/useView";
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import { worker } from "../helpers/mocks/browser";
import { createObjectEditor } from "../helpers/objectEditor";
import { updateVariableHandlers } from "../helpers/mocks/updateVariable/handlers";
import { fullAnalyticsSettings } from "../helpers/mocks/updateVariable/analyticsFixtures";

// Filling every section of the analytics form takes ~15s alone; leave
// headroom for a loaded full-suite run.
const SLOW_TEST_TIMEOUT = 90_000;

let view;
let driver;
let cleanup;
let analytics;
let keyValue;
let editor;

const prettyJson = (value) => JSON.stringify(value, null, 2);

const init = async () => {
  ({ view, driver, cleanup } = await useView(UpdateVariableView));
  editor = createObjectEditor(view);
  ({ analytics, keyValue } = editor);
  await driver.init({});
};

describe("Update variable JSON editor", () => {
  beforeEach(() => {
    worker.use(...updateVariableHandlers(["other", "sde1"]));
  });

  afterEach(() => {
    if (cleanup) cleanup();
  });

  describe("copying settings from the form to the JSON editor", () => {
    it(
      "copies settings from analytics form to JSON editor",
      async () => {
        await init();
        await analytics.fillFull();
        await analytics.selectWhole();
        await analytics.json.expectValue(
          prettyJson({
            campaign: "mycampaign",
            contextData: { key1: "value1", key2: "value2" },
            eVar2: "D=v10",
            eVar10: "value10",
            events: "scAdd,event1:123=value1",
            prop42: "value42",
            prop75: "D=c42",
            tnta: "mytnta",
          }),
        );
      },
      SLOW_TEST_TIMEOUT,
    );

    it("copies settings from the target form to the JSON editor", async () => {
      await init();
      await editor.tree.node("target").click();
      await keyValue.key(0).fill("zzz");
      await keyValue.value(0).fill("value1");
      await keyValue.addRow();
      await keyValue.key(1).fill("aaa");
      await keyValue.value(1).fill("value2");
      await keyValue.selectWhole();
      // Keys keep the order of the rows; only the JSON to form direction
      // sorts them.
      await keyValue.expectValue(prettyJson({ zzz: "value1", aaa: "value2" }));
      await editor.object.expectValue(
        prettyJson({ zzz: "value1", aaa: "value2" }),
      );
    });
  });

  describe("copying settings from the JSON editor to the form", () => {
    it("copies JSON settings to the analytics form", async () => {
      await init();
      await analytics.selectWhole();
      await analytics.json.fill(
        prettyJson({
          campaign: "mycampaign",
          contextData: { key1: "value1", key2: "value2" },
          eVar2: "D=v10",
          eVar10: "value10",
          events: "scAdd,event1:123=value1",
          prop42: "value42",
          prop75: "D=c42",
          tnta: "mytnta",
        }),
      );
      await analytics.selectParts();
      await analytics.expectFullForm();
      await driver.expectValidate().toBe(true);
      await driver
        .expectSettings((settings) => settings.data.__adobe.analytics)
        .toEqual(fullAnalyticsSettings);
    });

    it("copies JSON settings to the target form", async () => {
      await init();
      await editor.tree.node("target").click();
      await keyValue.selectWhole();
      await keyValue.enterValue(prettyJson({ zzz: "value1", aaa: "value2" }));
      await keyValue.selectParts();
      await keyValue.key(0).expectValue("aaa");
      await keyValue.value(0).expectValue("value2");
      await keyValue.key(1).expectValue("zzz");
      await keyValue.value(1).expectValue("value1");
    });
  });

  describe("errors in the form settings", () => {
    it("shows an empty JSON editor when there is an error in the analytics settings, and when you go back it shows the error", async () => {
      await init();
      await analytics.selectWhole();
      await analytics.json.fill('{ "eVar10": "value10" }');
      await analytics.selectParts();
      await analytics.evars.addRow();
      await analytics.evars.value(1).fill("value11");
      await analytics.selectWhole();
      await analytics.json.expectValue("");
      await analytics.selectParts();
      await analytics.evars.name(1).expectError(/please choose an evar/i);
    });

    it("shows an empty JSON editor when there is an error in the target settings, and when you go back it shows the error", async () => {
      await init();
      await editor.tree.node("target").click();
      await keyValue.selectWhole();
      await keyValue.enterValue('{ "aaa": "value1" }');
      await keyValue.selectParts();
      await keyValue.addRow();
      await keyValue.value(1).fill("value2");
      await keyValue.selectWhole();
      await keyValue.expectValue("");
      await keyValue.selectParts();
      await keyValue.key(1).expectError(/please provide a key name/i);
    });
  });

  describe("errors in the JSON settings", () => {
    it("shows empty analytics form when there is an error in the JSON settings", async () => {
      await init();
      await analytics.evars.name(0).searchAndSelectOption("eVar9");
      await analytics.evars.value(0).fill("value9");
      await analytics.selectWhole();
      await analytics.json.fill("error");
      await analytics.selectParts();
      await analytics.evars.name(0).expectValue("");
      await analytics.evars.value(0).expectValue("");
      await analytics.selectWhole();
      await analytics.json.expectValue("error");
      await analytics.json.expectError(/valid json object or a data element/i);
    });

    it("shows empty target form when there is an error in the JSON settings", async () => {
      await init();
      await editor.tree.node("target").click();
      await keyValue.key(0).fill("zzz");
      await keyValue.value(0).fill("value1");
      await keyValue.selectWhole();
      await keyValue.enterValue("error");
      await keyValue.selectParts();
      await keyValue.key(0).expectValue("");
      await keyValue.value(0).expectValue("");
      await keyValue.selectWhole();
      await keyValue.expectValue("error");
      await keyValue.expectError(
        /please enter a valid json or a data element/i,
      );
    });
  });
});
