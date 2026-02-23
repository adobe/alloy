/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default (extensionViewController, instanceNameField) => {
  test("shows instance options including option for instance that no longer exists", async () => {
    await extensionViewController.init({
      extensionSettings: {
        instances: [
          {
            name: "alloy1",
            edgeConfigId: "PR123",
          },
          {
            name: "alloy2",
            edgeConfigId: "PR456",
          },
        ],
      },
      settings: {
        instanceName: "alloydeleted",
      },
    });
    await instanceNameField.expectSelectedOptionLabel("alloydeleted (Deleted)");
    await instanceNameField.expectMenuOptionLabels([
      "alloydeleted (Deleted)",
      "alloy1",
      "alloy2",
    ]);
  });
};
