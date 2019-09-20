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

import createLifecycle from "../../../../src/core/createLifecycle";

describe("createLifecycle", () => {
  it("exposes all lifecycle methods and they return promises", () => {
    const componentRegistry = {
      getLifecycleCallbacks() {
        return [];
      }
    };
    const lifecycle = createLifecycle(componentRegistry);
    [
      "onComponentsRegistered",
      "onBeforeEvent",
      "onResponse",
      "onResponseError",
      "onBeforeDataCollection"
    ].forEach(methodName => {
      expect(lifecycle[methodName]()).toEqual(jasmine.any(Promise));
    });
  });

  it("calls all callbacks for a given lifecycle method", () => {
    const callbacks = [
      jasmine.createSpy().and.returnValue("valueFromCallback1"),
      jasmine.createSpy().and.returnValue(Promise.resolve("valueFromCallback2"))
    ];
    const componentRegistry = {
      getLifecycleCallbacks(hookName) {
        return hookName === "onBeforeEvent" ? callbacks : [];
      }
    };
    const lifecycle = createLifecycle(componentRegistry);
    return lifecycle.onBeforeEvent("arg1", "arg2").then(result => {
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalledWith("arg1", "arg2");
      });
      expect(result).toBeUndefined();
    });
  });

  it("ensures all callbacks for one method are called before any callbacks from a different method", () => {
    let lifecycle;
    const callbacksByHookName = {
      onComponentsRegistered: [
        jasmine.createSpy().and.callFake(() => {
          lifecycle.onBeforeEvent();
        }),
        jasmine.createSpy()
      ],
      onBeforeEvent: [jasmine.createSpy()]
    };
    const componentRegistry = {
      getLifecycleCallbacks(hookName) {
        return callbacksByHookName[hookName] || [];
      }
    };
    lifecycle = createLifecycle(componentRegistry);
    return lifecycle.onComponentsRegistered().then(() => {
      expect(
        callbacksByHookName.onComponentsRegistered[0]
      ).toHaveBeenCalledBefore(callbacksByHookName.onComponentsRegistered[1]);
      expect(
        callbacksByHookName.onComponentsRegistered[1]
      ).toHaveBeenCalledBefore(callbacksByHookName.onBeforeEvent[0]);
    });
  });
});
