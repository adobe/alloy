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
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import * as dataElementsMocks from "../../../helpers/endpointMocks/dataElementsMocks.mjs";
import * as dataElementMocks from "../../../helpers/endpointMocks/dataElementMocks.mjs";
import extensionViewController from "../../../helpers/extensionViewController.mjs";
import {
  individualAttributesOption,
  entireObjectOption,
  jsonEditor,
  eVarName,
  eVarAction,
  eVarValue,
  eVarCopy,
  eVarAddButton,
  propName,
  propAction,
  propValue,
  propCopy,
  propAddButton,
  eventName,
  eventId,
  eventValue,
  eventAddButton,
  contextDataDataElementOption,
  contextDataDataElementField,
  contextDataKey,
  contextDataValue,
  contextDataAddButton,
  additionalPropertiesName,
  additionalPropertiesValue,
  additionalPropertiesAddButton,
} from "../../../helpers/objectEditor/objectAnalyticsEdit.mjs";

createExtensionViewFixture({
  title: "Update variable analytics editor",
  viewPath: "actions/updateVariable.html",
  requiresAdobeIOIntegration: true,
});

test.requestHooks(dataElementsMocks.singleSolutions)(
  "returns minimal valid settings",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {},
      dataElementId: "SDE1",
    });
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "returns full valid settings",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await eVarName(0).openMenu();
    await eVarName(0).selectMenuOption("eVar10");
    await eVarValue(0).typeText("value10");
    await eVarAddButton.click();
    await eVarName(1).openMenu();
    await eVarName(1).selectMenuOption("eVar2");
    await eVarAction(1).selectOption("Copy from");
    await eVarCopy(1).openMenu();
    await eVarCopy(1).selectMenuOption("eVar10");

    await propName(0).openMenu();
    await propName(0).scrollDownToItem("prop42");
    await propName(0).selectMenuOption("prop42");
    await propValue(0).typeText("value42");
    await propAddButton.click();
    await propName(1).openMenu();
    await propName(1).scrollDownToItem("prop75");
    await propName(1).selectMenuOption("prop75");
    await propAction(1).selectOption("Copy from");
    await propCopy(1).enterSearch("prop4");
    await propCopy(1).selectMenuOption("prop42");

    await eventName(0).openMenu();
    await eventName(0).selectMenuOption("event1");
    await eventId(0).typeText("123");
    await eventValue(0).typeText("value1");
    await eventAddButton.click();
    await eventName(1).openMenu();
    await eventName(1).selectMenuOption("scAdd: Cart Addition");

    await contextDataKey(0).typeText("key1");
    await contextDataValue(0).typeText("value1");
    await contextDataAddButton.click();
    await contextDataKey(1).typeText("key2");
    await contextDataValue(1).typeText("value2");

    await additionalPropertiesName(0).openMenu();
    await additionalPropertiesName(0).selectMenuOption("Campaign");
    await additionalPropertiesValue(0).typeText("mycampaign");
    await additionalPropertiesAddButton.click();
    await additionalPropertiesName(1).enterSearch("tnta");
    await additionalPropertiesValue(1).typeText("mytnta");

    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          analytics: {
            eVar2: "D=v10",
            eVar10: "value10",
            prop42: "value42",
            prop75: "D=c42",
            events: "scAdd,event1:123=value1",
            contextData: {
              key1: "value1",
              key2: "value2",
            },
            campaign: "mycampaign",
            tnta: "mytnta",
          },
        },
      },
      dataElementId: "SDE1",
    });
  },
);

test.requestHooks(
  dataElementsMocks.singleSolutions,
  dataElementMocks.solutionsElement1,
)("it fills in values", async () => {
  await extensionViewController.init({
    propertySettings: {
      id: "PRabcd",
    },
    settings: {
      data: {
        __adobe: {
          analytics: {
            eVar2: "D=v10",
            eVar10: "value10",
            prop42: "value42",
            prop75: "D=c42",
            events: "scAdd,event1:123=value1",
            contextData: {
              key1: "value1",
              key2: "value2",
            },
            campaign: "mycampaign",
            tnta: "mytnta",
          },
        },
      },
      dataElementId: "SDE1",
    },
  });
  await eVarName(0).expectText("eVar2");
  await eVarAction(0).expectText("Copy from");
  await eVarCopy(0).expectText("eVar10");
  await eVarName(1).expectText("eVar10");
  await eVarAction(1).expectText("Set as");
  await eVarValue(1).expectValue("value10");
  await propName(0).expectText("prop42");
  await propValue(0).expectValue("value42");
  await propName(1).expectText("prop75");
  await propAction(1).expectText("Copy from");
  await propCopy(1).expectText("prop42");
  await eventName(0).expectText("scAdd: Cart Addition");
  await eventId(0).expectValue("");
  await eventValue(0).expectValue("");
  await eventName(1).expectText("event1");
  await eventId(1).expectValue("123");
  await eventValue(1).expectValue("value1");
  await contextDataKey(0).expectValue("key1");
  await contextDataValue(0).expectValue("value1");
  await contextDataKey(1).expectValue("key2");
  await contextDataValue(1).expectValue("value2");
  await additionalPropertiesName(0).expectText("Campaign");
  await additionalPropertiesValue(0).expectValue("mycampaign");
  await additionalPropertiesName(1).expectText("tnta");
  await additionalPropertiesValue(1).expectValue("mytnta");
});

test.requestHooks(dataElementsMocks.singleSolutions)(
  "returns single data element",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await entireObjectOption.click();
    await jsonEditor.clear();
    await jsonEditor.typeText("%data element%");
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          analytics: "%data element%",
        },
      },
      dataElementId: "SDE1",
    });
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "returns multiple data elements",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await eVarName(0).openMenu();
    await eVarName(0).selectMenuOption("eVar10");
    await eVarValue(0).typeText("%v10%");

    await propName(0).openMenu();
    await propName(0).selectMenuOption("prop11");
    await propValue(0).typeText("%c11%other%element%");

    await eventName(0).openMenu();
    await eventName(0).selectMenuOption("event1");
    await eventId(0).typeText("%id1%");
    await eventValue(0).typeText("%value1%");

    await contextDataDataElementOption.click();
    await contextDataDataElementField.typeText("%contextDataElement%");

    await additionalPropertiesName(0).openMenu();
    await additionalPropertiesName(0).selectMenuOption("Channel");
    await additionalPropertiesValue(0).typeText("%channel%");

    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          analytics: {
            eVar10: "%v10%",
            prop11: "%c11%other%element%",
            events: "event1:%id1%=%value1%",
            contextData: "%contextDataElement%",
            channel: "%channel%",
          },
        },
      },
      dataElementId: "SDE1",
    });
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "returns JSON modified data",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await entireObjectOption.click();
    await jsonEditor.clear();
    await jsonEditor.typeText('{"key1":"value1"}');
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          analytics: {
            key1: "value1",
          },
        },
      },
      dataElementId: "SDE1",
    });
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "switches between whole and parts population strategies with a data element",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await entireObjectOption.click();
    await jsonEditor.clear();
    await jsonEditor.typeText("%data element%");
    await extensionViewController.expectIsValid();
    await individualAttributesOption.click();
    await extensionViewController.expectIsValid();
    await entireObjectOption.click();
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          analytics: "%data element%",
        },
      },
      dataElementId: "SDE1",
    });
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "validates fields",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await eVarValue(0).typeText("value10");
    await eVarAddButton.click();
    await eVarName(1).openMenu();
    await eVarName(1).selectMenuOption("eVar10");
    await eVarAction(1).selectOption("Copy from");

    await propValue(0).typeText("value42");
    await propAddButton.click();
    await propName(1).openMenu();
    await propName(1).selectMenuOption("prop7");
    await propAction(1).selectOption("Copy from");

    await eventValue(0).typeText("123");
    await eventAddButton.click();
    await eventId(1).typeText("456");

    await contextDataValue(0).typeText("key1");

    await additionalPropertiesValue(0).typeText("mycampaign");

    await extensionViewController.expectIsNotValid();
    await eVarName(0).expectError();
    await eVarCopy(1).expectError();
    await propName(0).expectError();
    await propCopy(1).expectError();
    await eventName(0).expectError();
    await eventName(1).expectError();
    await contextDataKey(0).expectError();
    await additionalPropertiesName(0).expectError();
  },
);
