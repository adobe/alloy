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

import composePersonalizationResultingObject from "../../../../../../src/components/Personalization/utils/composePersonalizationResultingObject";

describe("Personalization::composePersonalizationResultingObject", () => {
  const decisions = [
    {
      blah: "123"
    },
    {
      blah: "345"
    }
  ];
  it("adds a renderAttempted flag if renderDecisions is true", () => {
    const result = composePersonalizationResultingObject(decisions, true);
    expect(result.propositions[0].renderAttempted).toEqual(true);
    expect(result.decisions).toBeUndefined();
  });

  it("returns decisions without renderAttempted flag and propositions with renderAttempted false when render decisions is false", () => {
    const result = composePersonalizationResultingObject(decisions, false);
    expect(result.propositions[0].renderAttempted).toEqual(false);
    expect(result.decisions).toEqual(decisions);
  });
});
