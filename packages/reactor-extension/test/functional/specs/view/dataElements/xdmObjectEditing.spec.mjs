/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t, Selector } from "testcafe";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";
import arrayEdit from "../../../helpers/objectEditor/arrayEdit.mjs";
import booleanEdit from "../../../helpers/objectEditor/booleanEdit.mjs";
import enumEdit from "../../../helpers/objectEditor/enumEdit.mjs";
import integerEdit from "../../../helpers/objectEditor/integerEdit.mjs";
import numberEdit from "../../../helpers/objectEditor/numberEdit.mjs";
import objectEdit from "../../../helpers/objectEditor/objectEdit.mjs";
import stringEdit from "../../../helpers/objectEditor/stringEdit.mjs";
import initializeExtensionView from "../../../helpers/objectEditor/initializeExtensionView.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";
import nodeEdit from "../../../helpers/objectEditor/nodeEdit.mjs";
import spectrum from "../../../helpers/spectrum.mjs";

const schema = {
  id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
  version: "1.5",
};

const schemaField = spectrum.comboBox("schemaField");

const moveUnifiedjsqeonlyTreeNodeOutOfViewport = async () => {
  await xdmTree.node("device").toggleExpansion();
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("implementationDetails").toggleExpansion();
  await xdmTree.node("placeContext").toggleExpansion();
  await t.scroll(0, 9999999999);
};

createExtensionViewFixture({
  title: "XDM Object Editing",
  viewPath: "dataElements/xdmObject.html",
  requiresAdobeIOIntegration: true,
});

runCommonExtensionViewTests();

test("initializes form fields with individual object attribute values", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            name: "Adobe",
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("name").click();
  await stringEdit.expectValue("Adobe");
});

test("allows user to provide individual object attribute values", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").expectExists();
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").expectExists();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("name").click();
  await stringEdit.enterValue("Adobe");
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        name: "Adobe",
      },
    },
  });
});

test("allows user to provide whole object value", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").click();
  await objectEdit.selectWholePopulationStrategy();
  await objectEdit.enterValue("%vendor%");
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: "%vendor%",
    },
  });
});

test("initializes form fields with whole object value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: "%vendor%",
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").click();
  await objectEdit.expectValue("%vendor%");
});

test("allows user to provide individual array items", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").click();
  await arrayEdit.addItem();

  // Testing that removal of items works as well.
  await arrayEdit.addItem();
  await arrayEdit.removeItem(0);

  await moveUnifiedjsqeonlyTreeNodeOutOfViewport();
  await arrayEdit.clickItem(0);
  // When the array item is selected in the form area, the array
  // item node in the tree gets scrolled into view. In some browsers,
  // this scroll is a smooth transition. We need to wait for the
  // transition to end before checking to see if the tree node is in
  // the viewport.
  await t.wait(1000);
  await xdmTree.node("Item 1").expectInViewport();
  await arrayEdit.enterValue("%industry%");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        industries: ["%industry%"],
      },
    },
  });
});

test("initializes form fields with individual array items", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            industries: ["%industry%"],
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").toggleExpansion();
  await xdmTree.node("Item 1").click();
  await arrayEdit.expectValue("%industry%");
});

test("allows user to provide whole array value", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").click();
  await arrayEdit.selectWholePopulationStrategy();
  await arrayEdit.enterValue("%industries%");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        industries: "%industries%",
      },
    },
  });
});

test("initializes form fields with whole array value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            industries: "%industries%",
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").click();
  await arrayEdit.expectValue("%industries%");
});

test("arrays using whole population strategy do not have children", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").click();
  await arrayEdit.selectPartsPopulationStrategy();
  await arrayEdit.addItem();
  await xdmTree.node("Item 1").expectExists();
  await arrayEdit.selectWholePopulationStrategy();
  await xdmTree.node("Item 1").expectNotExists();
});

test("arrays with a whole population strategy ancestor do not have children", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").click();
  await arrayEdit.selectPartsPopulationStrategy();
  await arrayEdit.addItem();
  await xdmTree.node("Item 1").expectExists();
  await xdmTree.node("vendor").click();
  await objectEdit.selectWholePopulationStrategy();
  await xdmTree.node("item 1").expectNotExists();
});

test("allows user to provide value for property with string type", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("name").click();
  await stringEdit.enterValue("%name%");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        name: "%name%",
      },
    },
  });
});

test("initializes form fields with string value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            name: "%name%",
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("name").click();
  await stringEdit.expectValue("%name%");
});

test("allows user to provide value for property with integer type", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("numEmployees").click();
  await integerEdit.enterValue("123");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        numEmployees: 123,
      },
    },
  });
});

test("initializes form fields with integer value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            numEmployees: 123,
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("numEmployees").click();
  await integerEdit.expectValue("123");
});

test("allows user to provide value for property with number type", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("revenue").click();
  await integerEdit.enterValue("123.123");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        revenue: 123.123,
      },
    },
  });
});

test("initializes form fields with number value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            revenue: 123.123,
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("revenue").click();
  await numberEdit.expectValue("123.123");
});

test("allows user to enter data element value for property with boolean type", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("isLicensed").click();
  await booleanEdit.enterDataElementValue("%isLicensed%");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        isLicensed: "%isLicensed%",
      },
    },
  });
});

test("initializes form fields with boolean data element value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            isLicensed: "%isLicensed%",
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("isLicensed").click();
  await booleanEdit.expectDataElementValue("%isLicensed%");
});

test("allows user to select true constant value for property with boolean type", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("isLicensed").click();
  await booleanEdit.selectConstantTrueValueField();

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        isLicensed: true,
      },
    },
  });
});

test("initializes form fields with boolean constant value of true", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            isLicensed: true,
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("isLicensed").click();
  await booleanEdit.expectConstantTrueValue();
});

test("allows user to select false constant value for property with boolean type", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("isLicensed").click();
  await booleanEdit.selectConstantFalseValueField();

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    _unifiedjsqeonly: {
      vendor: {
        isLicensed: false,
      },
    },
  });
});

test("initializes form fields with boolean constant value of false", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        _unifiedjsqeonly: {
          vendor: {
            isLicensed: false,
          },
        },
      },
    },
  });
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("isLicensed").click();
  await booleanEdit.expectConstantFalseValue();
});

test("allows user to select enum value for property with enum type", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").click();
  await enumEdit.selectEnumValue("Browser");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    environment: {
      type: "browser",
    },
  });
});

test("initializes form fields with enum value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        environment: {
          type: "application",
        },
      },
    },
  });
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").click();
  await enumEdit.expectEnumValue("Application");
});

test("invalidates enum property with custom value", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").click();
  await enumEdit.enterCustomValue("custom type");

  await extensionViewController.expectIsNotValid();
});

test("allows user to enter data element for enum property", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").click();
  await enumEdit.enterCustomValue("%dataElement%");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContainData({
    environment: {
      type: "%dataElement%",
    },
  });
});

test("initializes form fields with custom enum value", async () => {
  await initializeExtensionView({
    settings: {
      schema,
      data: {
        environment: {
          type: "%customType%",
        },
      },
    },
  });
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").click();
  await enumEdit.expectValue("%customType%");
});

test("disables auto-populated fields", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_id").click();
  await stringEdit.expectNotExists();
});

test("doesn't allow you to edit _id", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_id").click();
  await stringEdit.expectNotExists();
});

test("allows you to edit context fields", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").click();
  await stringEdit.expectExists();
});

test("clicking a breadcrumb item selects the item", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").click();
  await moveUnifiedjsqeonlyTreeNodeOutOfViewport();
  await nodeEdit.breadcrumb.item("vendor").click();
  // When the vendor breadcrumb item is clicked in the form area, the
  // vendor node in the tree gets scrolled into view. In some browsers,
  // this scroll is a smooth transition. We need to wait for the
  // transition to end before checking to see if the tree node is in
  // the viewport.
  await t.wait(1000);
  await xdmTree.node("vendor").expectInViewport();
  // It should be expanded, too.
  await xdmTree.node("industries").expectExists();
});

test("clicking a tree node should select and expand the node", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").click();
  await xdmTree.node("vendor").expectExists();
});

test("eVars are ordered numerically", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("Analytics Migration");
  await xdmTree.node("_experience").toggleExpansion();
  await xdmTree.node("analytics").toggleExpansion();
  await xdmTree.node("customDimensions").toggleExpansion();
  await xdmTree.node("eVars").toggleExpansion();
  // before fixing the sorting function, eVar10 followed eVar1
  await xdmTree.node("eVar1").next().expectTitleEquals("eVar2");
});

test("shows information icon for fields with descriptions", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("device").toggleExpansion();
  await xdmTree.node("colorDepth").click();

  const informationIcon = spectrum.button("nodeDescription");
  await informationIcon.expectExists();
  await informationIcon.click();

  const popover = Selector('[role="dialog"]');
  await t.expect(popover.exists).ok("Expected popover to appear");
  await t
    .expect(popover.withText("Color depth").exists)
    .ok("Expected popover to contain field title");
  await t
    .expect(
      popover.withText("The number of colors the display is able to represent.")
        .exists,
    )
    .ok("Expected popover to contain field description");

  await t.pressKey("esc");
  await t.expect(popover.exists).notOk("Expected popover to close");
});

test("node description popver shows field name when no display name is provided", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_experience").toggleExpansion();
  await xdmTree.node("decisioning").toggleExpansion();
  await xdmTree.node("propositionAction").toggleExpansion();
  await xdmTree.node("label").click();

  const informationIcon = spectrum.button("nodeDescription");
  await informationIcon.expectExists();
  await informationIcon.click();

  const popover = Selector('[role="dialog"]');
  await t.expect(popover.exists).ok("Expected popover to appear");
  await t
    .expect(popover.withText("label").exists)
    .ok("Expected popover to contain field title");
});

test("does not show information icon for fields without descriptions", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("name").click();

  const informationIcon = spectrum.button("nodeDescription");
  await informationIcon.expectNotExists();
});

test("shows clear button for string input fields and clears value when clicked", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("name").click();

  await stringEdit.enterValue("Adobe");
  await stringEdit.expectValue("Adobe");

  const clearButton = spectrum.button("clearButton");
  await clearButton.expectExists();
  await clearButton.expectEnabled();
  await clearButton.click();

  await stringEdit.expectValue("");

  await clearButton.expectDisabled();
});
