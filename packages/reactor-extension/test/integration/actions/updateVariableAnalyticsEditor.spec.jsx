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
import {
  SOLUTIONS_DATA_ELEMENT,
  fullAnalyticsSettings,
} from "../helpers/mocks/updateVariable/analyticsFixtures";

// Filling every section of the form takes ~15s alone; leave headroom for a
// loaded full-suite run.
const SLOW_TEST_TIMEOUT = 90_000;

let view;
let driver;
let cleanup;
let analytics;

const init = async (settings) => {
  ({ view, driver, cleanup } = await useView(UpdateVariableView));
  analytics = createObjectEditor(view).analytics;
  await driver.init({ settings });
};

const expectSavedAnalytics = (value) =>
  driver.expectSettings().toEqual({
    ...SOLUTIONS_DATA_ELEMENT,
    data: { __adobe: { analytics: value } },
  });

describe("Update variable analytics editor", () => {
  beforeEach(() => {
    // The only variable data element is selected, and with it the analytics
    // node.
    worker.use(...updateVariableHandlers(["other", "sde1"]));
  });

  afterEach(() => {
    if (cleanup) cleanup();
  });

  it("returns minimal valid settings", async () => {
    await init(null);
    await analytics.expectPartsSelected();
    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ ...SOLUTIONS_DATA_ELEMENT, data: {} });
  });

  it(
    "returns full valid settings",
    async () => {
      await init(null);
      await analytics.fillFull();
      await driver.expectValidate().toBe(true);
      await expectSavedAnalytics(fullAnalyticsSettings);
    },
    SLOW_TEST_TIMEOUT,
  );

  it("fills in values", async () => {
    await init({
      ...SOLUTIONS_DATA_ELEMENT,
      data: { __adobe: { analytics: fullAnalyticsSettings } },
    });
    await analytics.expectFullForm();
    await driver.expectValidate().toBe(true);
    await expectSavedAnalytics(fullAnalyticsSettings);
  });

  it("returns single data element", async () => {
    await init(null);
    await analytics.selectWhole();
    await analytics.json.fill("%data element%");
    await driver.expectValidate().toBe(true);
    await expectSavedAnalytics("%data element%");
  });

  it("returns multiple data elements", async () => {
    await init(null);
    await analytics.evars.name(0).searchAndSelectOption("eVar10");
    await analytics.evars.value(0).fill("%v10%");

    await analytics.props.name(0).searchAndSelectOption("prop11");
    await analytics.props.value(0).fill("%c11%other%element%");

    await analytics.events.name(0).searchAndSelectOption("event1");
    await analytics.events.id(0).fill("%id1%");
    await analytics.events.value(0).fill("%value1%");

    await analytics.contextDataElement.select();
    await analytics.contextDataElement.field.fill("%contextDataElement%");

    await analytics.additionalProperties.name(0).fill("Channel");
    await analytics.additionalProperties.value(0).fill("%channel%");

    await driver.expectValidate().toBe(true);
    await expectSavedAnalytics({
      eVar10: "%v10%",
      prop11: "%c11%other%element%",
      events: "event1:%id1%=%value1%",
      contextData: "%contextDataElement%",
      channel: "%channel%",
    });
  });

  it("returns JSON modified data", async () => {
    await init(null);
    await analytics.selectWhole();
    await analytics.json.fill('{"key1":"value1"}');
    await driver.expectValidate().toBe(true);
    await expectSavedAnalytics({ key1: "value1" });
  });

  it("switches between whole and parts population strategies with a data element", async () => {
    await init(null);
    await analytics.selectWhole();
    await analytics.json.fill("%data element%");
    await driver.expectValidate().toBe(true);
    await analytics.selectParts();
    await analytics.expectPartsSelected();
    await driver.expectValidate().toBe(true);
    await analytics.selectWhole();
    await analytics.expectWholeSelected();
    await driver.expectValidate().toBe(true);
    await expectSavedAnalytics("%data element%");
  });

  it("validates fields", async () => {
    await init({
      ...SOLUTIONS_DATA_ELEMENT,
      data: { __adobe: { analytics: { eVar10: "", prop7: "" } } },
    });
    await analytics.evars.action(0).selectOption("Copy from");
    await analytics.evars.addRow();
    await analytics.evars.value(1).fill("value10");

    await analytics.props.action(0).selectOption("Copy from");
    await analytics.props.addRow();
    await analytics.props.value(1).fill("value42");

    await analytics.events.value(0).fill("123");
    await analytics.events.addRow();
    await analytics.events.id(1).fill("456");

    await analytics.contextData.value(0).fill("key1");

    await analytics.additionalProperties.value(0).fill("mycampaign");

    await driver.expectValidate().toBe(false);
    await analytics.evars.name(1).expectError(/please choose an evar/i);
    await analytics.evars.copy(0).expectError(/please choose a value/i);
    await analytics.props.name(1).expectError(/please choose a prop/i);
    await analytics.props.copy(0).expectError(/please choose a value/i);
    await analytics.events.name(0).expectError(/please choose an event/i);
    await analytics.events.name(1).expectError(/please choose an event/i);
    await analytics.contextData
      .key(0)
      .expectError(/please provide a context data key/i);
    await analytics.additionalProperties
      .name(0)
      .expectError(/please choose an additional property/i);
  });
});
