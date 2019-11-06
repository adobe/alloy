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

import storageFactory from "../../../../src/utils/storageFactory";

describe("storageFactory", () => {
  [
    {
      storageProperty: "session",
      windowProperty: "sessionStorage"
    },
    {
      storageProperty: "persistent",
      windowProperty: "localStorage"
    }
  ].forEach(({ storageProperty, windowProperty }) => {
    describe(storageProperty, () => {
      describe("setItem", () => {
        it("sets item", () => {
          const window = {
            [windowProperty]: {
              setItem: jasmine.createSpy().and.returnValue(true)
            }
          };
          const storage = storageFactory(window)("example.");
          const result = storage[storageProperty].setItem("foo", "bar");
          expect(window[windowProperty].setItem).toHaveBeenCalledWith(
            "com.adobe.alloy.example.foo",
            "bar"
          );
          expect(result).toBeTrue();
        });

        it("returns false if an error occurs setting item", () => {
          const window = {
            [windowProperty]: {
              setItem: jasmine.createSpy().and.throwError()
            }
          };
          const storage = storageFactory(window)("example.");
          const result = storage[storageProperty].setItem("foo", "bar");
          expect(result).toBeFalse();
        });
      });

      describe("getItem", () => {
        it("gets item", () => {
          const window = {
            [windowProperty]: {
              getItem: jasmine.createSpy().and.returnValue("abc")
            }
          };
          const storage = storageFactory(window)("example.");
          const result = storage[storageProperty].getItem("foo");
          expect(window[windowProperty].getItem).toHaveBeenCalledWith(
            "com.adobe.alloy.example.foo"
          );
          expect(result).toBe("abc");
        });

        it("returns null if an error occurs while getting item", () => {
          const window = {
            [windowProperty]: {
              getItem: jasmine.createSpy().and.throwError()
            }
          };
          const storage = storageFactory(window)("example.");
          const result = storage[storageProperty].getItem("foo");
          expect(result).toBeNull();
        });
      });
    });
  });
});
