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
import extensionViewController from "../../../helpers/extensionViewController.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";

const dataElementField = spectrum.comboBox("dataElementField");
const clearField = spectrum.checkbox("clearField");

createExtensionViewFixture({
  title: "Update variable action view (Clear checkbox)",
  viewPath: "actions/updateVariable.html",
  requiresAdobeIOIntegration: true,
});

test.requestHooks(dataElementsMocks.multipleBothTypes)(
  "Allows the user to clear an element for an XDM variable",
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
    await xdmTree.node("vendor").click();
    await clearField.click();

    await extensionViewController.expectSettings({
      data: {},
      dataElementId: "DE2",
      schema: {
        id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
        version: "1.5",
      },
      transforms: {
        "_unifiedjsqeonly.vendor": {
          clear: true,
        },
      },
    });
  },
);

test.requestHooks(dataElementsMocks.multipleBothTypes)(
  "Allows the user to clear an element for a DATA variable",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test solutions variable 2");
    await clearField.click();

    await extensionViewController.expectSettings({
      data: {},
      dataElementId: "SDE2",
      transforms: {
        "__adobe.target": {
          clear: true,
        },
      },
    });
  },
);

test.requestHooks(dataElementsMocks.multipleBothTypes)(
  "Allows the user to clear the root element for an XDM variable",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test data variable 2");
    await xdmTree.node("xdm").expectExists();
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

test.requestHooks(dataElementsMocks.multipleBothTypes)(
  "Allows the user to clear the root element for a DATA variable",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
    });
    await dataElementField.openMenu();
    await dataElementField.selectMenuOption("Test solutions variable 2");
    await xdmTree.node("data").expectExists();
    await xdmTree.node("data").click();
    await clearField.click();

    await extensionViewController.expectSettings({
      data: {},
      dataElementId: "SDE2",
      transforms: {
        "": {
          clear: true,
        },
      },
    });
  },
);

test.requestHooks(
  dataElementsMocks.multipleBothTypes,
  dataElementMocks.element2,
)("Allows a cleared element to be loaded for an XDM variable", async () => {
  await extensionViewController.init({
    propertySettings: {
      id: "PRabcd",
    },
    settings: {
      data: {},
      dataElementId: "DE2",
      transforms: {
        "_unifiedjsqeonly.vendor": {
          clear: true,
        },
      },
    },
  });
  await dataElementField.expectText("Test data variable 2");
  await xdmTree.node("xdm").expectExists();
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").click();
  await clearField.expectChecked();
});

test.requestHooks(
  dataElementsMocks.multipleBothTypes,
  dataElementMocks.solutionsElement1,
)("Allows a cleared element to be loaded for a DATA variable", async () => {
  await extensionViewController.init({
    propertySettings: {
      id: "PRabcd",
    },
    settings: {
      data: {},
      dataElementId: "SDE1",
      transforms: {
        "__adobe.target": {
          clear: true,
        },
      },
    },
  });
  await xdmTree.node("target").click();
  await dataElementField.expectText("Test solutions variable 1");
  await clearField.expectChecked();
});

test.requestHooks(
  dataElementsMocks.multipleBothTypes,
  dataElementMocks.element2,
)(
  "Allows the root cleared element to be loaded for XDM variables",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
      settings: {
        data: {},
        dataElementId: "DE2",
        transforms: {
          "": {
            clear: true,
          },
        },
      },
    });
    await dataElementField.expectText("Test data variable 2");
    await xdmTree.node("xdm").expectExists();
    await xdmTree.node("xdm").click();
    await clearField.expectChecked();
  },
);

test.requestHooks(
  dataElementsMocks.multipleBothTypes,
  dataElementMocks.solutionsElement1,
)(
  "Allows the root cleared element to be loaded for DATA variables",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
      settings: {
        data: {},
        dataElementId: "SDE1",
        transforms: {
          "": {
            clear: true,
          },
        },
      },
    });
    await dataElementField.expectText("Test solutions variable 1");
    await xdmTree.node("data").expectExists();
    await xdmTree.node("data").click();
    await clearField.expectChecked();
  },
);

test.requestHooks(dataElementsMocks.multiple, dataElementMocks.element2)(
  "disables clear checkbox of sub-elements",
  async () => {
    await extensionViewController.init({
      propertySettings: {
        id: "PRabcd",
      },
      settings: {
        data: {},
        dataElementId: "DE2",
        transforms: {
          "_unifiedjsqeonly.vendor": {
            clear: true,
          },
        },
      },
    });
    await dataElementField.expectText("Test data variable 2");
    await xdmTree.node("xdm").expectExists();
    await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
    await xdmTree.node("vendor").toggleExpansion();
    await xdmTree.node("name").click();
    await clearField.expectChecked();
    await clearField.expectDisabled();
  },
);
