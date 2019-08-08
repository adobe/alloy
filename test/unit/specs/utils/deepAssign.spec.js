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

import deepAssign from "../../../../src/utils/deepAssign";
import assign from "../../../../src/utils/assign";

describe("deepAssign", () => {
  it("should copy values like assign", () => {
    expect(deepAssign({}, { a: 1 }, { b: 2 })).toEqual(
      assign({}, { a: 1 }, { b: 2 })
    );
  });

  it("should copy values recursively assign", () => {
    const result = deepAssign(
      {},
      { a: { c: 1 } },
      { b: 2 },
      { a: { c: 2, d: 3 } }
    );

    expect(result).toEqual({ a: { c: 2, d: 3 }, b: 2 });
  });
});
