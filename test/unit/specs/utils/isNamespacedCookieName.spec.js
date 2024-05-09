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

import isNamespacedCookieName from "../../../../src/utils/isNamespacedCookieName.js";

describe("isNamespacedCookieName", () => {
  it("returns true if it's a namespaced cookie name", () => {
    const result = isNamespacedCookieName(
      "ABC@CustomOrg",
      "kndctr_ABC_CustomOrg_foo",
    );
    expect(result).toBeTrue();
  });

  it("returns false if it's not a namespaced cookie name", () => {
    const result = isNamespacedCookieName(
      "kndctr_DEF_CustomOrg_foo",
      "ABC@CustomOrg",
    );
    expect(result).toBeFalse();
  });
});
