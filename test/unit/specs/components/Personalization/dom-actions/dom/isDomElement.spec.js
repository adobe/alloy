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

import { appendNode, createNode } from "../../../../../../../src/utils/dom";
import cleanUpDomChanges from "../../../../../helpers/cleanUpDomChanges";
import isDomElement from "../../../../../../../src/components/Personalization/dom-actions/dom/isDomElement";

describe("Personalization::DOM::isDomElement", () => {
  const testElementId = "superfluous123";

  beforeEach(() => {
    const element = createNode("div", {
      id: testElementId,
      class: `test-element-${testElementId}`
    });
    element.innerHTML = "test element";
    appendNode(document.body, element);
  });

  afterEach(() => {
    cleanUpDomChanges(testElementId);
  });

  it("validates dom element", () => {
    expect(isDomElement(document.getElementById(testElementId))).toBeTrue();
  });

  it("validates not a dom element", () => {
    expect(isDomElement({}).toBeFalse);
    expect(isDomElement([]).toBeFalse);
    expect(isDomElement(true).toBeFalse);
    expect(isDomElement("something").toBeFalse);
  });
});
