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

import isLegacyCookieName from "../../../../src/utils/isLegacyCookieName";

describe("isLegacyCookieName", () => {
  it("returns true if it's at_qa_mode cookie", () => {
    const result = isLegacyCookieName("at_qa_mode");
    expect(result).toBeTrue();
  });

  if (
    ("returns true if it's mbox cookie",
    () => {
      expect(isLegacyCookieName("mbox")).toBeTrue();
    })
  );

  it("returns false if it's not a legacy cookie name", () => {
    const result = isLegacyCookieName("ABC@CustomOrg");
    expect(result).toBeFalse();
  });
});
