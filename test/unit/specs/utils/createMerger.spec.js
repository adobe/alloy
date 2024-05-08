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

import createMerger from "../../../../src/utils/createMerger.js";

describe("createMerger", () => {
  it("populates key if key doesn't exist", () => {
    const content = {};
    createMerger(
      content,
      "fruit"
    )({
      type: "apple"
    });
    expect(content).toEqual({
      fruit: {
        type: "apple"
      }
    });
  });

  it("deeply merges if key does exist", () => {
    const content = {
      foods: {
        fruits: {
          apple: {
            calories: 95
          },
          banana: {
            calories: 105
          }
        }
      }
    };
    createMerger(
      content,
      "foods"
    )({
      fruits: {
        banana: {
          calories: 110
        },
        cherry: {
          calories: 77
        }
      }
    });
    expect(content).toEqual({
      foods: {
        fruits: {
          apple: {
            calories: 95
          },
          banana: {
            calories: 110
          },
          cherry: {
            calories: 77
          }
        }
      }
    });
  });
});
