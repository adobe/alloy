/*
Copyright 2022 Adobe. All rights reserved.
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
import extensionViewController from "../../../helpers/extensionViewController.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";
import * as anEdit from "../../../helpers/objectEditor/objectAnalyticsEdit.mjs";
import * as jsonEdit from "../../../helpers/objectEditor/objectJsonEdit.mjs";

createExtensionViewFixture({
  title: "Update variable action view",
  viewPath: "actions/updateVariable.html",
  requiresAdobeIOIntegration: false,
});

runCommonExtensionViewTests();

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Copies settings from analytics form to JSON editor",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await anEdit.eVarName(0).openMenu();
    await anEdit.eVarName(0).selectMenuOption("eVar10");
    await anEdit.eVarValue(0).typeText("value10");
    await anEdit.eVarAddButton.click();
    await anEdit.eVarName(1).openMenu();
    await anEdit.eVarName(1).selectMenuOption("eVar2");
    await anEdit.eVarAction(1).selectOption("Copy from");
    await anEdit.eVarCopy(1).openMenu();
    await anEdit.eVarCopy(1).selectMenuOption("eVar10");

    await anEdit.propName(0).openMenu();
    await anEdit.propName(0).scrollDownToItem("prop42");
    await anEdit.propName(0).selectMenuOption("prop42");
    await anEdit.propValue(0).typeText("value42");
    await anEdit.propAddButton.click();
    await anEdit.propName(1).openMenu();
    await anEdit.propName(1).scrollDownToItem("prop75");
    await anEdit.propName(1).selectMenuOption("prop75");
    await anEdit.propAction(1).selectOption("Copy from");
    await anEdit.propCopy(1).enterSearch("prop4");
    await anEdit.propCopy(1).selectMenuOption("prop42");

    await anEdit.eventName(0).openMenu();
    await anEdit.eventName(0).selectMenuOption("event1");
    await anEdit.eventId(0).typeText("123");
    await anEdit.eventValue(0).typeText("value1");
    await anEdit.eventAddButton.click();
    await anEdit.eventName(1).openMenu();
    await anEdit.eventName(1).selectMenuOption("scAdd: Cart Addition");

    await anEdit.contextDataKey(0).typeText("key1");
    await anEdit.contextDataValue(0).typeText("value1");
    await anEdit.contextDataAddButton.click();
    await anEdit.contextDataKey(1).typeText("key2");
    await anEdit.contextDataValue(1).typeText("value2");

    await anEdit.additionalPropertiesName(0).openMenu();
    await anEdit.additionalPropertiesName(0).selectMenuOption("Campaign");
    await anEdit.additionalPropertiesValue(0).typeText("mycampaign");
    await anEdit.additionalPropertiesAddButton.click();
    await anEdit.additionalPropertiesName(1).enterSearch("tnta");
    await anEdit.additionalPropertiesValue(1).typeText("mytnta");

    await anEdit.entireObjectOption.click();
    await anEdit.jsonEditor.expectValue(
      JSON.stringify(
        {
          campaign: "mycampaign",
          contextData: {
            key1: "value1",
            key2: "value2",
          },
          eVar2: "D=v10",
          eVar10: "value10",
          events: "scAdd,event1:123=value1",
          prop42: "value42",
          prop75: "D=c42",
          tnta: "mytnta",
        },
        null,
        2,
      ),
    );
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Copies settings from the target form to the JSON editor",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    xdmTree.node("target").click();
    jsonEdit.key(0).typeText("zzz");
    jsonEdit.value(0).typeText("value1");
    jsonEdit.propertyAddButton.click();
    jsonEdit.key(1).typeText("aaa");
    jsonEdit.value(1).typeText("value2");
    jsonEdit.entireObjectOption.click();
    jsonEdit.jsonEditor.expectValue(
      JSON.stringify(
        {
          aaa: "value2",
          zzz: "value1",
        },
        null,
        2,
      ),
    );
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Copies JSON settings to the analytics form",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await anEdit.entireObjectOption.click();
    await anEdit.jsonEditor.typeText(
      JSON.stringify(
        {
          campaign: "mycampaign",
          contextData: {
            key1: "value1",
            key2: "value2",
          },
          eVar2: "D=v10",
          eVar10: "value10",
          events: "scAdd,event1:123=value1",
          prop42: "value42",
          prop75: "D=c42",
          tnta: "mytnta",
        },
        null,
        2,
      ),
    );

    await anEdit.individualAttributesOption.click();

    await anEdit.eVarName(0).expectText("eVar2");
    await anEdit.eVarAction(0).expectText("Copy from");
    await anEdit.eVarCopy(0).expectText("eVar10");
    await anEdit.eVarName(1).expectText("eVar10");
    await anEdit.eVarAction(1).expectText("Set as");
    await anEdit.eVarValue(1).expectValue("value10");
    await anEdit.propName(0).expectText("prop42");
    await anEdit.propValue(0).expectValue("value42");
    await anEdit.propName(1).expectText("prop75");
    await anEdit.propAction(1).expectText("Copy from");
    await anEdit.propCopy(1).expectText("prop42");
    await anEdit.eventName(0).expectText("scAdd: Cart Addition");
    await anEdit.eventId(0).expectValue("");
    await anEdit.eventValue(0).expectValue("");
    await anEdit.eventName(1).expectText("event1");
    await anEdit.eventId(1).expectValue("123");
    await anEdit.eventValue(1).expectValue("value1");
    await anEdit.contextDataKey(0).expectValue("key1");
    await anEdit.contextDataValue(0).expectValue("value1");
    await anEdit.contextDataKey(1).expectValue("key2");
    await anEdit.contextDataValue(1).expectValue("value2");
    await anEdit.additionalPropertiesName(0).expectText("Campaign");
    await anEdit.additionalPropertiesValue(0).expectValue("mycampaign");
    await anEdit.additionalPropertiesName(1).expectText("tnta");
    await anEdit.additionalPropertiesValue(1).expectValue("mytnta");
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Copies JSON settings to the target form",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await xdmTree.node("target").click();
    await jsonEdit.entireObjectOption.click();
    await jsonEdit.jsonEditor.typeText(
      JSON.stringify(
        {
          zzz: "value1",
          aaa: "value2",
        },
        null,
        2,
      ),
    );
    await jsonEdit.individualAttributesOption.click();
    await jsonEdit.key(0).expectValue("aaa");
    await jsonEdit.value(0).expectValue("value2");
    await jsonEdit.key(1).expectValue("zzz");
    await jsonEdit.value(1).expectValue("value1");
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Shows an empty JSON editor when there is an error in the analytics settings, and when you go back it shows the error.",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await anEdit.entireObjectOption.click();
    await anEdit.jsonEditor.typeText('{ "eVar10": "value10" }');
    await anEdit.individualAttributesOption.click();
    await anEdit.eVarAddButton.click();
    await anEdit.eVarValue(1).typeText("value11");
    await anEdit.entireObjectOption.click();
    await anEdit.jsonEditor.expectValue("");
    await anEdit.individualAttributesOption.click();
    await anEdit.eVarName(1).expectError();
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Shows an empty JSON editor when there is an error in the target settings, and when you go back it shows the error",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await xdmTree.node("target").click();
    await jsonEdit.entireObjectOption.click();
    await jsonEdit.jsonEditor.typeText('{ "aaa": "value1" }');
    await jsonEdit.individualAttributesOption.click();
    await jsonEdit.propertyAddButton.click();
    await jsonEdit.value(1).typeText("value2");
    await jsonEdit.entireObjectOption.click();
    await jsonEdit.jsonEditor.expectValue("");
    await jsonEdit.individualAttributesOption.click();
    await jsonEdit.key(1).expectError();
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Shows empty analytics form when there is an error in the JSON settings",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await anEdit.eVarName(0).openMenu();
    await anEdit.eVarName(0).selectMenuOption("eVar9");
    await anEdit.eVarValue(0).typeText("value9");
    await anEdit.entireObjectOption.click();
    await anEdit.jsonEditor.clear();
    await anEdit.jsonEditor.typeText("error");
    await anEdit.individualAttributesOption.click();
    await anEdit.eVarName(0).expectText("");
    await anEdit.eVarValue(0).expectValue("");
    await anEdit.entireObjectOption.click();
    await anEdit.jsonEditor.expectValue("error");
    await anEdit.jsonEditor.expectError();
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "Shows empty target form when there is an error in the JSON settings",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await xdmTree.node("target").click();
    await jsonEdit.key(0).typeText("zzz");
    await jsonEdit.value(0).typeText("value1");
    await jsonEdit.entireObjectOption.click();
    await jsonEdit.jsonEditor.clear();
    await jsonEdit.jsonEditor.typeText("error");
    await jsonEdit.individualAttributesOption.click();
    await jsonEdit.key(0).expectValue("");
    await jsonEdit.value(0).expectValue("");
    await jsonEdit.entireObjectOption.click();
    await jsonEdit.jsonEditor.expectValue("error");
    await jsonEdit.jsonEditor.expectError();
  },
);
