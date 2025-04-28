/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect, afterAll } from "vitest";
import awaitSelector from "../../../../../src/utils/dom/awaitSelector.js";

describe("awaitSelector", () => {
  it("await via requestAnimationFrame", async () => {
    // Create test element
    const testElement = document.createElement("div");
    testElement.id = "def";

    // Immediately append element to document
    document.body.appendChild(testElement);

    try {
      // Now wait for selector
      await awaitSelector("#def");

      // Element found, verify it exists in DOM
      const foundElement = document.querySelector("#def");
      expect(foundElement).toBeTruthy();
      expect(foundElement.id).toBe("def");
    } finally {
      // Cleanup
      if (testElement.parentNode) {
        document.body.removeChild(testElement);
      }
    }
  });

  // Ensure cleanup after all tests
  afterAll(() => {
    const element = document.querySelector("#def");
    if (element) {
      element.parentNode.removeChild(element);
    }
  });
});
