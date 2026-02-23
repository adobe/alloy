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
  key,
  value,
  propertyAddButton,
  jsonEditor,
} from "../../../helpers/objectEditor/objectJsonEdit.mjs";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";

createExtensionViewFixture({
  title: "Update variable key value editor",
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
    xdmTree.node("target").click();
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
    xdmTree.node("target").click();
    await key(0).typeText("key1");
    await value(0).typeText("value1");
    await propertyAddButton.click();
    await key(1).typeText("key2");
    await value(1).typeText("value2");
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          target: {
            key1: "value1",
            key2: "value2",
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
          target: {
            key1: "value1",
            key2: "value2",
          },
        },
      },
      dataElementId: "SDE1",
    },
  });
  await key(0).expectValue("key1");
  await value(0).expectValue("value1");
  await key(1).expectValue("key2");
  await value(1).expectValue("value2");
});

test.requestHooks(dataElementsMocks.singleSolutions)(
  "returns single data element",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    xdmTree.node("target").click();
    await entireObjectOption.click();
    await jsonEditor.clear();
    await jsonEditor.typeText("%data element%");
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          target: "%data element%",
        },
      },
      dataElementId: "SDE1",
    });
  },
);

test.requestHooks(dataElementsMocks.singleSolutions)(
  "returns data element values",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    xdmTree.node("target").click();
    await key(0).typeText("key1");
    await value(0).typeText("%value1%");
    await propertyAddButton.click();
    await key(1).typeText("key2");
    await value(1).typeText("%value2%");
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          target: {
            key1: "%value1%",
            key2: "%value2%",
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
    xdmTree.node("target").click();
    await entireObjectOption.click();
    await jsonEditor.clear();
    await jsonEditor.typeText('{"key1":"value1"}');
    await extensionViewController.expectIsValid();
    await extensionViewController.expectSettings({
      data: {
        __adobe: {
          target: {
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
    xdmTree.node("target").click();
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
          target: "%data element%",
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
    xdmTree.node("target").click();
    await value(0).typeText("value10");
    await extensionViewController.expectIsNotValid();
    await key(0).expectError();
  },
);
