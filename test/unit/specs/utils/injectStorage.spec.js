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

import injectStorage from "../../../../src/utils/injectStorage";

describe("injectStorage", () => {
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
          const storage = injectStorage(window)("example.");
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
          const storage = injectStorage(window)("example.");
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
          const storage = injectStorage(window)("example.");
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
          const storage = injectStorage(window)("example.");
          const result = storage[storageProperty].getItem("foo");
          expect(result).toBeNull();
        });
      });

      describe("clear", () => {
        it("clears all with the namespace prefix", () => {
          const window = {
            [windowProperty]: {
              removeItem: jasmine.createSpy(),
              "com.adobe.alloy.example.a": "1",
              "com.adobe.alloy.example.b": "2",
              c: "3",
              "com.adobe.alloy.d": "4"
            }
          };
          const storage = injectStorage(window)("example.");
          storage[storageProperty].clear();
          expect(window[windowProperty].removeItem).toHaveBeenCalledWith(
            "com.adobe.alloy.example.a"
          );
          expect(window[windowProperty].removeItem).toHaveBeenCalledWith(
            "com.adobe.alloy.example.b"
          );
          expect(window[windowProperty].removeItem).not.toHaveBeenCalledWith(
            "c"
          );
          expect(window[windowProperty].removeItem).not.toHaveBeenCalledWith(
            "com.adobe.alloy.d"
          );
        });
      });
    });
  });
});
