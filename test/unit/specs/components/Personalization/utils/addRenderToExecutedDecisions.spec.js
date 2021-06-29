/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import addRenderToExecutedDecisions from "../../../../../../src/components/Personalization/utils/addRenderToExecutedDecisions";

describe("Personalization::addRenderToExecutedDecisions", () => {
  it("adds a render flag", () => {
    const decisions = [
      {
        blah: "123"
      },
      {
        blah: "345"
      }
    ];
    const result = addRenderToExecutedDecisions(decisions);
    expect(result[0].rendered).toEqual(true);
    expect(result[1].rendered).toEqual(true);
  });
});
