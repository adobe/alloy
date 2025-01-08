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

import { vi, describe, it, expect } from "vitest";
import createInstanceFunction from "../../../../src/core/createInstanceFunction.js";
import flushPromiseChains from "../../helpers/flushPromiseChains.js";

describe("createInstance", () => {
  it("successfully executes command", () => {
    const executeCommand = vi
      .fn()
      .mockReturnValue(Promise.resolve("commandresult"));
    const resolve = vi.fn();
    const reject = vi.fn();
    const instance = createInstanceFunction(executeCommand);
    instance([
      resolve,
      reject,
      [
        "event",
        {
          foo: "bar",
        },
      ],
    ]);
    expect(executeCommand).toHaveBeenCalledWith("event", {
      foo: "bar",
    });
    return flushPromiseChains().then(() => {
      expect(resolve).toHaveBeenCalledWith("commandresult");
      expect(reject).not.toHaveBeenCalled();
    });
  });
  it("unsuccessfully execute command", () => {
    const executeCommand = vi
      .fn()
      .mockReturnValue(Promise.reject(new Error("error occurred")));
    const resolve = vi.fn();
    const reject = vi.fn();
    const instance = createInstanceFunction(executeCommand);
    instance([
      resolve,
      reject,
      [
        "event",
        {
          foo: "bar",
        },
      ],
    ]);
    expect(executeCommand).toHaveBeenCalledWith("event", {
      foo: "bar",
    });
    return flushPromiseChains().then(() => {
      expect(resolve).not.toHaveBeenCalled();
      expect(reject).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
