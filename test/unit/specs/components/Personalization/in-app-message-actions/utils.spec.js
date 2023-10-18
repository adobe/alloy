/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { removeElementById } from "../../../../../../src/components/Personalization/in-app-message-actions/utils";

describe("removeElementById", () => {
  beforeEach(() => {
    document.body.innerHTML = `
  <div id="test-element"></div>
`;
  });

  it("should remove an element when it exists", () => {
    const elementId = "test-element";
    const element = document.getElementById(elementId);

    expect(element).toBeTruthy();

    removeElementById(elementId);

    expect(document.getElementById(elementId)).toBeNull();
  });

  it("should do nothing when the element does not exist", () => {
    const nonExistentId = "non-existent-element";

    removeElementById(nonExistentId);

    expect(document.getElementById(nonExistentId)).toBeNull();
  });
});
