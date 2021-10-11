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

import {
  cleanupPrefix,
  isNotShadowSelector,
  splitWithShadow
} from "../../../../../../../src/components/Personalization/dom-actions/dom/helperForShadow";

describe("Personalization::DOM::helperForShadow", () => {
  it("should detect shadow selectors", () => {
    let selector =
      "BODY > BUY-NOW-BUTTON:nth-of-type(2):shadow > DIV:nth-of-type(1)";
    let result = isNotShadowSelector(selector);
    expect(result).toBeFalse();
    selector = "BODY > BUY-NOW-BUTTON:nth-of-type(2) > DIV:nth-of-type(1)";
    result = isNotShadowSelector(selector);
    expect(result).toBeTrue();
  });

  it("should split shadow selectors", () => {
    const selector =
      "BODY > BUY-NOW-BUTTON:nth-of-type(2):shadow > DIV:nth-of-type(1)";
    const parts = splitWithShadow(selector);
    expect(parts[0]).toEqual("BODY > BUY-NOW-BUTTON:nth-of-type(2)");
    expect(parts[1]).toEqual(" > DIV:nth-of-type(1)");
  });

  it("should clean up selector prefix", () => {
    let selector = " > BUY-NOW-BUTTON:nth-of-type(2)";
    let result = cleanupPrefix(selector);
    expect(result).toEqual("BUY-NOW-BUTTON:nth-of-type(2)");
    selector = ">  BUY-NOW-BUTTON:nth-of-type(2)";
    result = cleanupPrefix(selector);
    expect(result).toEqual("BUY-NOW-BUTTON:nth-of-type(2)");
    selector = ">BUY-NOW-BUTTON:nth-of-type(2)";
    result = cleanupPrefix(selector);
    expect(result).toEqual("BUY-NOW-BUTTON:nth-of-type(2)");
  });
});
