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

import isShadowSelector from "../../../../../src/utils/dom/isShadowSelector";

describe("Utils::DOM::isShadowSelector", () => {
  it("should detect shadow selectors", () => {
    let selector =
      "BODY > BUY-NOW-BUTTON:nth-of-type(2):shadow > DIV:nth-of-type(1)";
    let result = isShadowSelector(selector);
    expect(result).toBeTrue();
    selector = "BODY > BUY-NOW-BUTTON:nth-of-type(2) > DIV:nth-of-type(1)";
    result = isShadowSelector(selector);
    expect(result).toBeFalse();
  });
});
