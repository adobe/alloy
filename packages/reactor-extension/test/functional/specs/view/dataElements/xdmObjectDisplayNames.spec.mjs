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

import { t, Selector } from "testcafe";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";
import initializeExtensionView from "../../../helpers/objectEditor/initializeExtensionView.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
createExtensionViewFixture({
  title: "XDM Object Display Names",
  viewPath: "dataElements/xdmObject.html",
  requiresAdobeIOIntegration: true,
});

test("toggles between display names and field IDs", async () => {
  await initializeExtensionView({
    settings: {
      schema: {
        id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
        version: "1.5",
      },
      data: {
        _unifiedjsqeonly: {
          vendor: {
            name: "Adobe",
          },
        },
      },
    },
  });

  // Wait for schema to load and API responses
  await t.wait(2000);

  // Expand the path to the name field
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await t.wait(200);
  await xdmTree.node("vendor").toggleExpansion();
  await t.wait(200);

  // Check if the node exists using direct selector
  const nameNode = Selector(
    '[data-test-id="xdmTreeNodeTitleDisplayName"]',
  ).withText("name");
  await t.expect(await nameNode.exists).ok("Field ID 'name' should be visible");

  // Toggle to show display names
  await xdmTree.toggleDisplayNames();
  await t.wait(200);

  const displayNameNode = Selector(
    '[data-test-id="xdmTreeNodeTitleDisplayName"]',
  ).withText("Name");
  await t
    .expect(await displayNameNode.exists)
    .ok("Display name 'Name' should be visible");

  // Toggle back to show field IDs
  await xdmTree.toggleDisplayNames();
  await t.wait(200);
  await t
    .expect(await nameNode.exists)
    .ok("Field ID 'name' should be visible again");
});
