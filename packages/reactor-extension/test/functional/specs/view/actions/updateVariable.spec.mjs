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
import * as dataElementMocks from "../../../helpers/endpointMocks/dataElementMocks.mjs";
import * as schemasMocks from "../../../helpers/endpointMocks/schemasMocks.mjs";
import * as schemaMocks from "../../../helpers/endpointMocks/schemaMocks.mjs";
import extensionViewController from "../../../helpers/extensionViewController.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";
import stringEdit from "../../../helpers/objectEditor/stringEdit.mjs";
import arrayEdit from "../../../helpers/objectEditor/arrayEdit.mjs";

const errorBoundaryMessage = spectrum.illustratedMessage(
  "errorBoundaryMessage",
);
const dataElementField = spectrum.comboBox("dataElementField");
const clearField = spectrum.checkbox("clearField");
const noDataElementsAlert = spectrum.alert("noDataElements");
const schemaChangedNotice = spectrum.alert("schemaChangedNotice");
const dataElementSchemaMissingAlert = spectrum.alert(
  "dataElementSchemaMissingAlert",
);

createExtensionViewFixture({
  title: "Update variable action view",
  viewPath: "actions/updateVariable.html",
  requiresAdobeIOIntegration: true,
});

runCommonExtensionViewTests();

test.requestHooks(dataElementsMocks.notFound)(
  "displays an error when the access token for data elements is invalid",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await errorBoundaryMessage.expectMessage(/Failed to load data elements\./);
  },
);

test.requestHooks(dataElementsMocks.single)(
  "selects the variable when there is only one",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.expectText("Test data variable 1");
    await noDataElementsAlert.expectNotExists();
    await xdmTree.node("xdm").expectExists();
  },
);

test.requestHooks(
  dataElementsMocks.noneWithNextPage,
  dataElementsMocks.secondPageWithOne,
)(
  "selects the variable when there are lots of data elements, but only one variable data element",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.expectText("Test data variable 1");
    await xdmTree.node("xdm").expectExists();
  },
);

test.requestHooks(dataElementsMocks.multiple)(
  "Allows the user to select a data element",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 2");
    await xdmTree.node("xdm").expectExists();
    await extensionViewController.expectSettings({
      data: {},
      dataElementId: "DE2",
      schema: {
        id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
        version: "1.5",
      },
    });
  },
);

test.requestHooks(dataElementsMocks.multiple)(
  "Allows the user to select a data element and set the XDM",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 2");
    await xdmTree.node("xdm").expectExists();
    await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
    await xdmTree.node("vendor").toggleExpansion();
    await xdmTree.node("name").click();
    await stringEdit.expectExists();
    await stringEdit.enterValue("name1");

    await extensionViewController.expectSettings({
      data: {
        _unifiedjsqeonly: {
          vendor: {
            name: "name1",
          },
        },
      },
      dataElementId: "DE2",
      schema: {
        id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
        version: "1.5",
      },
    });
  },
);

test.requestHooks(dataElementsMocks.multiple)(
  "Allows the user to clear the root level",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 2");
    await xdmTree.node("xdm").click();
    await clearField.click();

    await extensionViewController.expectSettings({
      data: {},
      dataElementId: "DE2",
      schema: {
        id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
        version: "1.5",
      },
      transforms: {
        "": {
          clear: true,
        },
      },
    });
  },
);

test.requestHooks(dataElementsMocks.none)(
  "Handle no variable data elements",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await noDataElementsAlert.expectExists();
  },
);

test.requestHooks(dataElementMocks.element1, dataElementsMocks.multiple)(
  "Shows warning when the schema version changed",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
      settings: {
        dataElementId: "DE1",
        schema: {
          id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
          version: "1.1",
        },
        data: {},
      },
    });
    await schemaChangedNotice.expectExists();
  },
);

test.requestHooks(
  dataElementMocks.element3,
  dataElementsMocks.multiple,
  schemaMocks.basic,
)("doesn't show warning when the schema version is the same", async (t) => {
  await extensionViewController.init({
    propertySettings: {
      id: "PRabcd",
    },
    settings: {
      dataElementId: "DE3",
      schema: {
        id: "sch123",
        version: "1.0",
      },
      data: {},
    },
  });
  await schemaChangedNotice.expectNotExists();
});

test.requestHooks(
  dataElementMocks.element3,
  dataElementsMocks.multiple,
  schemasMocks.multiple,
)(
  "shows info message when selected data element's schema cannot be loaded",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
      // No schemaMocks to satisfy fetchSchema; this causes schema fetch to fail per our view logic
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 3");
    await dataElementSchemaMissingAlert.expectExists();
  },
);

test.requestHooks(
  dataElementMocks.element3,
  dataElementsMocks.multiple,
  schemasMocks.multiple,
)(
  "shows info message when initialized with data element whose schema cannot be loaded",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
      settings: {
        dataElementId: "DE3",
        schema: {
          id: "sch123",
          version: "1.0",
        },
        data: {},
      },
    });
    await dataElementSchemaMissingAlert.expectExists();
  },
);

test.requestHooks(
  dataElementsMocks.multiple,
  schemaMocks.basic,
  schemasMocks.multiple,
)(
  "alert disappears when selecting element with readable schema, and reappears when selecting one without",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });

    // First, pick the one that cannot load schema
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 4");
    await dataElementSchemaMissingAlert.expectExists();

    // Now pick an element with a loadable schema (DE1/DE2)
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 1");
    await dataElementSchemaMissingAlert.expectNotExists();

    // And then pick the problematic one again; alert should show
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 4");
    await dataElementSchemaMissingAlert.expectExists();
  },
);

test.requestHooks(
  schemaMocks.basic,
  schemaMocks.other,
  dataElementsMocks.multiple,
)(
  "keeps data around when changing data elements and schema objects",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 4");
    await xdmTree.node("testField").click();
    await stringEdit.enterValue("myvalue1");
    await xdmTree.node("otherField").click();
    await stringEdit.enterValue("myvalue2");
    await dataElementField.openMenu();

    await dataElementField.selectMenuOption("Test data variable 3");
    await xdmTree.node("testField").click();
    await stringEdit.expectValue("myvalue1");
    await xdmTree.node("otherField").expectNotExists();
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 4");
    await xdmTree.node("testField").click();
    await stringEdit.expectValue("myvalue1");
    await xdmTree.node("otherField").click();
    await stringEdit.expectValue("myvalue2");

    extensionViewController.expectSettings({
      data: {
        testField: "myvalue1",
        otherField: "myvalue2",
      },
      dataElementId: "DE4",
      schema: {
        id: "sch456",
        version: "1.0",
      },
    });
  },
);

test.requestHooks(
  schemaMocks.basic,
  schemaMocks.other,
  dataElementsMocks.multiple,
)("keeps data around when data element is no longer found.", async (t) => {
  await extensionViewController.init({
    propertySettings: {
      id: "PRabcd",
    },
    settings: {
      dataElementId: "not_found",
      schema: {
        id: "sch456",
        version: "1.0",
      },
      data: {
        testField: "myvalue1",
        otherField: "myvalue2",
      },
    },
  });
  await dataElementField.openMenu();
  await dataElementField.selectMenuOption("Test data variable 4");
  await xdmTree.node("testField").click();
  await stringEdit.expectValue("myvalue1");
  await xdmTree.node("otherField").click();
  await stringEdit.expectValue("myvalue2");
});

test.requestHooks(
  schemaMocks.basicArray,
  schemaMocks.otherArray,
  dataElementsMocks.multiple,
)(
  "keeps data around when changing data elements and schema arrays",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 6");
    await xdmTree.node("xdm").click();
    await arrayEdit.addItem();
    await arrayEdit.addItem();
    await xdmTree.node("Item 1").toggleExpansion();
    await xdmTree.node("testField").click();
    await stringEdit.enterValue("myvalue1");
    await xdmTree.node("otherField").click();
    await stringEdit.enterValue("myvalue2");
    await xdmTree.node("Item 1").toggleExpansion();
    await xdmTree.node("Item 2").toggleExpansion();
    await xdmTree.node("testField").click();
    await stringEdit.enterValue("myvalue3");
    await xdmTree.node("otherField").click();
    await stringEdit.enterValue("myvalue4");
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 5");
    await extensionViewController.expectSettings({
      data: [
        {
          testField: "myvalue1",
        },
        {
          testField: "myvalue3",
        },
      ],
      dataElementId: "DE5",
      schema: {
        id: "sch789",
        version: "1.0",
      },
    });
    await xdmTree.node("Item 1").toggleExpansion();
    await xdmTree.node("testField").click();
    await stringEdit.expectValue("myvalue1");
    await xdmTree.node("otherField").expectNotExists();
    await xdmTree.node("Item 1").toggleExpansion();
    await xdmTree.node("Item 2").toggleExpansion();
    await xdmTree.node("testField").click();
    await stringEdit.expectValue("myvalue3");
    await xdmTree.node("otherField").expectNotExists();
    await xdmTree.node("xdm").click();
    await arrayEdit.removeItem(0);
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 6");
    await xdmTree.node("Item 1").toggleExpansion();
    await xdmTree.node("testField").click();
    await stringEdit.expectValue("myvalue3");
    await xdmTree.node("otherField").click();
    await stringEdit.expectValue("myvalue4");
  },
);

test.requestHooks(
  schemaMocks.basic,
  schemaMocks.other,
  dataElementsMocks.multiple,
)("allows you to search for data elements", async () => {
  await extensionViewController.init({
    propertySettings: {
      id: "PRabcd",
    },
  });
  await dataElementField.clear();
  await dataElementField.enterSearch("4");
  // Because we are using mocks we can't actually search for the data element.
  // The mock will return the same data elements no matter what. This does make
  // sure we don't get an error when searching.
  await dataElementField.expectMenuOptionLabelsInclude([
    "Test data variable 4",
  ]);
});
