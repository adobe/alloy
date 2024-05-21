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

import createCallbackAggregator from "../../../../src/utils/createCallbackAggregator.js";

describe("createCallbackAggregator", () => {
  let callbackAggregator;

  beforeEach(() => {
    callbackAggregator = createCallbackAggregator();
  });

  it("calls all added callbacks and returns a combined promise", () => {
    const callback1 = jasmine.createSpy("callback1").and.returnValue("foo");
    const callback2 = jasmine.createSpy("callback2").and.returnValue("bar");
    callbackAggregator.add(callback1);
    callbackAggregator.add(callback2);
    return callbackAggregator.call("cherry", "tree").then((result) => {
      expect(callback1).toHaveBeenCalledWith("cherry", "tree");
      expect(callback2).toHaveBeenCalledWith("cherry", "tree");
      expect(result).toEqual(["foo", "bar"]);
    });
  });

  it("doesn't throw errors when there are no callbacks", () => {
    return callbackAggregator.call("cherry", "tree").then((result) => {
      expect(result).toEqual([]);
    });
  });

  it("doesn't throw errors when there are no arguments", () => {
    const callback = jasmine.createSpy("callback").and.returnValue("foo");
    callbackAggregator.add(callback);
    return callbackAggregator.call().then((result) => {
      expect(result).toEqual(["foo"]);
    });
  });
});
