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
import { string, arrayOf, number } from "../../../../../src/utils/validation";

describe("validation::createUniqueItems", () => {
  it(`validates an empty array`, () => {
    const validator = arrayOf(string()).uniqueItems();
    validator([]);
  });

  it(`validates an array of one item`, () => {
    const validator = arrayOf(string()).uniqueItems();
    validator(["a"]);
  });

  it(`throws an error on an array with duplicate (string) items`, () => {
    const validator = arrayOf(string()).uniqueItems();
    expect(() => validator(["a", "b", "a", "e"])).toThrowError();
  });

  it(`throws an error on an array with duplicate integers`, () => {
    const validator = arrayOf(number()).uniqueItems();
    expect(() => validator([1, 2, 3, 4, 4, 5])).toThrowError();
  });

  it(`validates an array of enums`, () => {
    const validator = arrayOf(number()).uniqueItems();
    validator([]);
  });

  it(`validates an array of null or undefined`, () => {
    const validator = arrayOf(string()).uniqueItems();
    validator([null, undefined]);
  });

  it(`complains about required when null or undefined`, () => {
    const validator = arrayOf(string())
      .uniqueItems()
      .required();
    expect(() => validator([null, undefined])).toThrowError();
  });
});
