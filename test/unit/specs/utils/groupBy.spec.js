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

import groupBy from "../../../../src/utils/groupBy";

describe("groupBy", () => {
  it("expects empty obj if array is empty", () => {
    const array = [];
    expect(groupBy(array, null)).toEqual({});
  });

  it("expects to group by key getter provided", () => {
    const array = [
      { id: 1, name: "Foo" },
      { id: 2, name: "Foo2" },
      { id: 2, name: "Foo3" }
    ];

    const map = {
      1: [{ id: 1, name: "Foo" }],
      2: [{ id: 2, name: "Foo2" }, { id: 2, name: "Foo3" }]
    };

    expect(groupBy(array, item => item.id || "default")).toEqual(map);
  });

  it("expects to group by key getter provided or to the default key", () => {
    const array = [
      { id: 1, name: "Foo" },
      { id: 2, name: "Foo2" },
      { id: 2, name: "Foo3" },
      { noId: 2, name: "Foo3" }
    ];

    const map = {
      1: [{ id: 1, name: "Foo" }],
      2: [{ id: 2, name: "Foo2" }, { id: 2, name: "Foo3" }],
      default: [{ noId: 2, name: "Foo3" }]
    };

    expect(groupBy(array, item => item.id || "default")).toEqual(map);
  });
});
