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
import createLifecycle from "../../../../src/core/createLifecycle.js";

describe("createLifecycle", () => {
  it("exposes all lifecycle methods and they return promises", () => {
    const componentRegistry = {
      getLifecycleCallbacks() {
        return [];
      },
    };
    const lifecycle = createLifecycle(componentRegistry);
    [
      "onComponentsRegistered",
      "onBeforeEvent",
      "onBeforeRequest",
      "onResponse",
      "onRequestFailure",
      "onClick",
    ].forEach((methodName) => {
      expect(lifecycle[methodName]()).toEqual(expect.any(Promise));
    });
  });
  it("calls all callbacks for a given lifecycle method", () => {
    const callbacks = [
      vi.fn().mockReturnValue({
        returnValue1: "valueFromCallback1",
      }),
      vi.fn().mockReturnValue(
        Promise.resolve({
          returnValue2: "valueFromCallback2",
        }),
      ),
    ];
    const componentRegistry = {
      getLifecycleCallbacks(hookName) {
        return hookName === "onBeforeEvent" ? callbacks : [];
      },
    };
    const lifecycle = createLifecycle(componentRegistry);
    return lifecycle.onBeforeEvent("arg1", "arg2").then((result) => {
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledWith("arg1", "arg2");
      });
      expect(result).toBeInstanceOf(Array);
      expect(result[0].returnValue1).toEqual("valueFromCallback1");
      expect(result[1].returnValue2).toEqual("valueFromCallback2");
    });
  });
  it("ensures all callbacks for one method are called before any callbacks from a different method", async () => {
    let lifecycle;
    const callbacksByHookName = {
      onComponentsRegistered: [
        vi.fn().mockImplementation(() => {
          lifecycle.onBeforeEvent();
        }),
        vi.fn(),
      ],
      onBeforeEvent: [vi.fn()],
    };
    const componentRegistry = {
      getLifecycleCallbacks(hookName) {
        return callbacksByHookName[hookName] || [];
      },
    };
    lifecycle = createLifecycle(componentRegistry);

    await lifecycle.onComponentsRegistered();

    const callOrder1 =
      callbacksByHookName.onComponentsRegistered[0].mock.invocationCallOrder[0];
    const callOrder2 =
      callbacksByHookName.onComponentsRegistered[1].mock.invocationCallOrder[0];
    const callOrder3 =
      callbacksByHookName.onBeforeEvent[0].mock.invocationCallOrder[0];

    expect(callOrder1).toBeLessThan(callOrder2);
    expect(callOrder2).toBeLessThan(callOrder3);
  });
});
