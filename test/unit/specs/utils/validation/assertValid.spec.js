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

import assertValid from "../../../../../src/utils/validation/assertValid";

describe("validation::assertValid", () => {
  it("throws an error when it is invalid", () => {
    expect(() =>
      assertValid(false, "myValue", "myPath", "myMessage")
    ).toThrowMatching(e => {
      expect(e.message).toEqual(
        "'myPath': Expected myMessage, but got 'myValue'."
      );
      return true;
    });
  });

  it("does not throw an error when it is valid", () => {
    expect(assertValid(true, "myValue", "myPath", "myMessage")).toBeUndefined();
  });
});
