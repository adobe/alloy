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

import elementHasClickHandler from "../../../../../../../src/components/ActivityCollector/utils/dom/elementHasClickHandler.js";

describe("ActivityCollector::elementHasClickHandler", () => {
  it("should handle invalid elements", () => {
    const invalidElements = [
      { element: null },
      { element: undefined },
      { element: {} },
      { element: { onclick: null } },
      { element: { onclick: undefined } },
    ];
    invalidElements.forEach(({ element }) => {
      expect(elementHasClickHandler(element)).toBe(false);
    });
  });

  it("should handle elements with click handlers", () => {
    const clickHandlerElements = [
      { element: { onclick: () => {} } },
      { element: { onclick() {} } },
    ];
    clickHandlerElements.forEach(({ element }) => {
      expect(elementHasClickHandler(element)).toBe(true);
    });
  });
});
