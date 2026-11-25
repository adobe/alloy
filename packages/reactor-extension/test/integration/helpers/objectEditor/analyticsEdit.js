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

import field from "../field";

/*
Driver for the Adobe Analytics form of the object editor (the `analytics` node
of a data variable). Its test ids are generated from the form field path:

  properties.data.properties.__adobe.properties.analytics.value.<array>.<i>.<field>

  const analytics = createAnalyticsEdit(view);
  analytics.selectWhole() / selectParts()
  analytics.json                        // whole-object text area (field())
  analytics.evars | props | events | contextData | additionalProperties
    .name(i) / .action(i) / .value(i) / .copy(i) / .id(i) / .key(i)   // field() per row
    .addRow()
  analytics.evars.name(i).searchAndSelectOption(label)  // also props/events name, copy
  analytics.contextDataElement.select() / .field
  analytics.fillFull() / analytics.expectFullForm()   // see fullAnalyticsSettings

Every row field is a field() from helpers/field.js. The eVar/prop/event lists
are virtualized, so most options aren't in the DOM until scrolled to: use
searchAndSelectOption, which types the label to filter the list down to it and
then clicks the option.
*/

const PREFIX = "properties.data.properties.__adobe.properties.analytics";

export default (view) => {
  const byId = (id) => field(view.getByTestId(`${PREFIX}.${id}`));
  const rowField = (array, index, name) =>
    byId(`value.${array}.${index}.${name}`);

  const comboRow = (array, nameField) => ({
    name: (index) => rowField(array, index, nameField),
    action: (index) => rowField(array, index, "actionField"),
    value: (index) => rowField(array, index, "valueTextField"),
    copy: (index) => rowField(array, index, "copyField"),
    addRow: () => byId(`value.${array}AddButton`).click(),
  });

  const analytics = {
    selectParts: () => byId("valuePartsOption").check(),
    selectWhole: () => byId("valueWholeOption").check(),
    expectPartsSelected: () => byId("valuePartsOption").expectChecked(),
    expectWholeSelected: () => byId("valueWholeOption").expectChecked(),
    json: byId("valueWhole"),
    evars: comboRow("evars", "evarField"),
    props: comboRow("props", "propField"),
    events: {
      ...comboRow("events", "eventField"),
      id: (index) => rowField("events", index, "idTextField"),
    },
    contextData: {
      key: (index) => rowField("contextData", index, "keyTextField"),
      value: (index) => rowField("contextData", index, "valueTextField"),
      addRow: () => byId("value.contextDataAddButton").click(),
    },
    contextDataElement: {
      select: () => byId("value.contextDataDataElementOption").check(),
      field: byId("value.contextDataDataElementField"),
    },
    additionalProperties: {
      name: (index) => rowField("additionalProperties", index, "propertyField"),
      value: (index) =>
        rowField("additionalProperties", index, "valueTextField"),
      addRow: () => byId("value.additionalPropertiesAddButton").click(),
    },
  };

  const fillFull = async () => {
    const { evars, props, events, contextData, additionalProperties } =
      analytics;
    await evars.name(0).searchAndSelectOption("eVar10");
    await evars.value(0).fill("value10");
    await evars.addRow();
    await evars.name(1).searchAndSelectOption("eVar2");
    await evars.action(1).selectOption("Copy from");
    await evars.copy(1).searchAndSelectOption("eVar10");

    await props.name(0).searchAndSelectOption("prop42");
    await props.value(0).fill("value42");
    await props.addRow();
    await props.name(1).searchAndSelectOption("prop75");
    await props.action(1).selectOption("Copy from");
    await props.copy(1).searchAndSelectOption("prop42");

    await events.name(0).searchAndSelectOption("event1");
    await events.id(0).fill("123");
    await events.value(0).fill("value1");
    await events.addRow();
    await events.name(1).searchAndSelectOption("scAdd: Cart Addition");

    await contextData.key(0).fill("key1");
    await contextData.value(0).fill("value1");
    await contextData.addRow();
    await contextData.key(1).fill("key2");
    await contextData.value(1).fill("value2");

    await additionalProperties.name(0).fill("Campaign");
    await additionalProperties.value(0).fill("mycampaign");
    await additionalProperties.addRow();
    await additionalProperties.name(1).fill("tnta");
    await additionalProperties.value(1).fill("mytnta");
  };

  const expectFullForm = async () => {
    const { evars, props, events, contextData, additionalProperties } =
      analytics;
    await evars.name(0).expectValue("eVar2");
    await evars.action(0).expectValue("Copy from");
    await evars.copy(0).expectValue("eVar10");
    await evars.name(1).expectValue("eVar10");
    await evars.action(1).expectValue("Set as");
    await evars.value(1).expectValue("value10");
    await props.name(0).expectValue("prop42");
    await props.value(0).expectValue("value42");
    await props.name(1).expectValue("prop75");
    await props.action(1).expectValue("Copy from");
    await props.copy(1).expectValue("prop42");
    await events.name(0).expectValue("scAdd: Cart Addition");
    await events.id(0).expectValue("");
    await events.value(0).expectValue("");
    await events.name(1).expectValue("event1");
    await events.id(1).expectValue("123");
    await events.value(1).expectValue("value1");
    await contextData.key(0).expectValue("key1");
    await contextData.value(0).expectValue("value1");
    await contextData.key(1).expectValue("key2");
    await contextData.value(1).expectValue("value2");
    await additionalProperties.name(0).expectValue("Campaign");
    await additionalProperties.value(0).expectValue("mycampaign");
    await additionalProperties.name(1).expectValue("tnta");
    await additionalProperties.value(1).expectValue("mytnta");
  };

  return { ...analytics, fillFull, expectFullForm };
};
