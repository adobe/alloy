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

import executeWithRetry from "../../../../src/utils/executeWithRetry";

describe("executeWithRetry", () => {
  it("executes a function only once if promise is resolved", () => {
    const fn = jasmine.createSpy().and.returnValue(Promise.resolve("abc"));
    return executeWithRetry(fn, 10).then(result => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe("abc");
    });
  });

  it("executes a function multiple times if promise is rejected", () => {
    const fn = jasmine.createSpy().and.callFake(() => {
      return fn.calls.count() < 4 ? Promise.reject() : Promise.resolve("abc");
    });
    return executeWithRetry(fn, 10).then(result => {
      expect(fn).toHaveBeenCalledTimes(4);
      expect(result).toBe("abc");
    });
  });

  it("executes a function until maxRetries is met if promise is rejected", () => {
    const mockError = new Error("bad thing");
    const fn = jasmine.createSpy().and.returnValue(Promise.reject(mockError));
    return executeWithRetry(fn, 10).catch(error => {
      expect(fn).toHaveBeenCalledTimes(11);
      expect(error).toBe(mockError);
    });
  });
});
