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

import { describe, it } from "vitest";
import field from "../field";
import { instances } from "./fixtures";
import setUpView from "./setUpView";

/**
 * Port of TestCafe's testInstanceNameOptions.mjs: a saved instance that no
 * longer exists is listed first with a "(Deleted)" suffix.
 *
 * @param {object} options
 * @param {() => Promise<{ view, driver, cleanup }>} options.openView
 * @param {string} options.pickerTestId data-test-id of the instance picker.
 * @param {object} [options.extensionSettings] Extension settings to initialize with. Must contain alloy1 and alloy2.
 */
export default function runInstanceNameOptionsTest({
  openView,
  pickerTestId,
  extensionSettings = { instances },
}) {
  describe("instance name options", () => {
    const opened = setUpView(openView);

    it("shows instance options including option for instance that no longer exists", async () => {
      await opened.driver.init({
        extensionSettings,
        settings: { instanceName: "alloydeleted" },
      });

      const picker = field(opened.view.getByTestId(pickerTestId));
      await picker.expectValue("alloydeleted (Deleted)");
      await picker.expectMenuOptionLabels([
        "alloydeleted (Deleted)",
        "alloy1",
        "alloy2",
      ]);
    });
  });
}
