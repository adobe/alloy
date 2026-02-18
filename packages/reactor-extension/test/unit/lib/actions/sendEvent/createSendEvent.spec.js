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

import { describe, it, expect, beforeEach, vi } from "vitest";
import createSendEvent from "../../../../../src/lib/actions/sendEvent/createSendEvent";

describe("Send Event", () => {
  let getConfigOverrides;

  beforeEach(() => {
    getConfigOverrides = vi.fn();
  });

  it("executes event command and notifies sendEventCallbackStorage", () => {
    const instance = vi.fn().mockResolvedValue({ foo: "bar" });
    const instanceManager = {
      getInstance: vi.fn().mockReturnValue(instance),
    };
    const sendEventCallbackStorage = {
      triggerEvent: vi.fn(),
    };

    const action = createSendEvent({
      instanceManager,
      sendEventCallbackStorage,
      getConfigOverrides,
    });

    const dataLayer = {
      fruits: [
        {
          name: "banana",
          calories: 105,
        },
        {
          name: "blueberry",
          calories: 5,
        },
      ],
    };

    const promiseReturnedFromAction = action({
      instanceName: "myinstance",
      renderDecisions: true,
      xdm: dataLayer,
    });

    expect(instanceManager.getInstance).toHaveBeenCalledWith("myinstance");
    expect(instance).toHaveBeenCalledWith("sendEvent", {
      renderDecisions: true,
      edgeConfigOverrides: undefined,
      xdm: {
        fruits: [
          {
            name: "banana",
            calories: 105,
          },
          {
            name: "blueberry",
            calories: 5,
          },
        ],
      },
    });

    // Ensure the XDM object was cloned
    const xdmOption = instance.mock.calls[0][1].xdm;
    expect(xdmOption).not.toBe(dataLayer);
    expect(xdmOption).toEqual(dataLayer);

    return promiseReturnedFromAction;
  });

  it("throws an error when no matching instance found", () => {
    const instanceManager = {
      getInstance: vi.fn(),
    };
    const action = createSendEvent({ instanceManager, getConfigOverrides });

    expect(() => {
      action({
        instanceName: "myinstance",
        renderDecisions: true,
        xdm: {
          foo: "bar",
        },
      });
    }).toThrow(
      'Failed to send event for instance "myinstance". No matching instance was configured with this name.',
    );
  });

  it("calls sendEvent with edgeConfigOverrides", () => {
    const instance = vi.fn().mockResolvedValue({ foo: "bar" });
    getConfigOverrides.mockReturnValue({
      test: "test",
    });
    const instanceManager = {
      getInstance: vi.fn().mockReturnValue(instance),
    };
    const sendEventCallbackStorage = {
      triggerEvent: vi.fn(),
    };

    const action = createSendEvent({
      instanceManager,
      sendEventCallbackStorage,
      getConfigOverrides,
    });

    const promiseReturnedFromAction = action({
      instanceName: "myinstance",
      renderDecisions: true,
      edgeConfigOverrides: {
        development: {
          test: "test",
        },
      },
    });

    expect(instance).toHaveBeenCalledWith("sendEvent", {
      renderDecisions: true,
      edgeConfigOverrides: {
        test: "test",
      },
    });

    return promiseReturnedFromAction;
  });
});
