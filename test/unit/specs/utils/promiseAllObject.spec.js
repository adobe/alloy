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

import promiseAllObject from "../../../../src/utils/promiseAllObject";

const createFoodLibrary = () => {
  return {
    fruits: [
      {
        name: "Apple",
        calories: 95
      },
      {
        name: "Avocado",
        calories: Promise.resolve(234)
      },
      {
        name: "Banana",
        calories: 133
      },
      Promise.resolve("Cherry")
    ],
    vegetables: Promise.resolve([
      {
        name: "Artichoke",
        calories: 60
      }
    ]),
    grains: [
      {
        name: "bread",
        calories: 109
      }
    ],
    dateValue: new Date("December 17, 1995 03:24:00"),
    functionValue: () => {},
    regexValue: /abc/gi,
    nullValue: null,
    undefinedValue: undefined
  };
};

const expectedResult = {
  fruits: [
    {
      name: "Apple",
      calories: 95
    },
    {
      name: "Avocado",
      calories: 234
    },
    {
      name: "Banana",
      calories: 133
    },
    "Cherry"
  ],
  vegetables: [
    {
      name: "Artichoke",
      calories: 60
    }
  ],
  grains: [
    {
      name: "bread",
      calories: 109
    }
  ],
  dateValue: jasmine.any(Date),
  functionValue: jasmine.any(Function),
  regexValue: jasmine.any(RegExp),
  nullValue: null,
  undefinedValue: undefined
};

describe("promiseAllObject", () => {
  it("waits for nested promises inside object", () => {
    const foodLibrary = createFoodLibrary();
    return promiseAllObject(foodLibrary).then(resolvedFoodLibrary => {
      // Check that it's a new object.
      expect(resolvedFoodLibrary).not.toBe(foodLibrary);
      expect(resolvedFoodLibrary).toEqual(expectedResult);
    });
  });

  it("waits for nested promises inside array", () => {
    const foodLibrary = [createFoodLibrary()];
    return promiseAllObject(foodLibrary).then(resolvedFoodLibrary => {
      // Check that it's a new array.
      expect(resolvedFoodLibrary).not.toBe(foodLibrary);
      expect(resolvedFoodLibrary).toEqual([expectedResult]);
    });
  });

  it("rejects promise if nested promise is rejected", () => {
    const foodLibrary = createFoodLibrary();
    foodLibrary.vegetables = Promise.reject(new Error("custom message"));
    return promiseAllObject(foodLibrary)
      .then(fail)
      .catch(error => {
        expect(error.message).toBe("custom message");
      });
  });
});
