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

import createInstanceManager from "../../../../src/lib/instanceManager/createInstanceManager";
import {
  MANAGED,
  PREINSTALLED,
} from "../../../../src/lib/constants/libraryType";

describe("Instance Manager", () => {
  let instanceManager;
  let turbine;
  let mockWindow;
  let createCustomInstance;
  let createEventMergeId;
  let wrapOnBeforeEventSend;
  let onBeforeEventSend;
  let alloy1;
  let alloy2;
  let alloy3;
  let extensionSettings;
  let getConfigOverrides;

  const build = () => {
    instanceManager = createInstanceManager({
      turbine,
      window: mockWindow,
      createCustomInstance,
      orgId: "ABC@AdobeOrg",
      createEventMergeId,
      wrapOnBeforeEventSend,
      getConfigOverrides,
    });
  };

  beforeEach(() => {
    extensionSettings = {
      libraryCode: {
        type: MANAGED,
      },
      instances: [
        {
          name: "alloy1",
          edgeConfigId: "PR123",
          stagingEdgeConfigId: "PR123:stage",
          developmentEdgeConfigId: "PR123:dev",
        },
        {
          name: "alloy2",
          edgeConfigId: "PR456",
          orgId: "DIFFERENTORG@AdobeOrg",
        },
      ],
    };
    turbine = {
      getExtensionSettings: vi.fn().mockReturnValue(extensionSettings),
      onDebugChanged: vi.fn(),
      environment: { stage: "production" },
      debugEnabled: false,
      logger: {
        warn: vi.fn(),
        error: vi.fn(),
      },
    };
    mockWindow = {};
    getConfigOverrides = vi.fn();
    alloy1 = vi.fn();
    alloy2 = vi.fn();
    createCustomInstance = vi.fn().mockImplementation(({ name }) => {
      if (name === "alloy1") {
        return alloy1;
      }
      if (name === "alloy2") {
        return alloy2;
      }
      if (name === "alloy3") {
        return alloy3;
      }
      return undefined;
    });
    onBeforeEventSend = vi.fn();
    wrapOnBeforeEventSend = vi.fn().mockReturnValue(onBeforeEventSend);
  });

  it("creates SDK instances", () => {
    build();
    expect(mockWindow).toEqual({
      alloy1,
      alloy2,
      __alloyNS: ["alloy1", "alloy2"],
      __alloyMonitors: [
        {
          onInstanceCreated: expect.any(Function),
          onInstanceConfigured: expect.any(Function),
          onBeforeCommand: expect.any(Function),
        },
      ],
    });
  });

  it("adds a new monitor to the window.__alloyMonitors", () => {
    const monitor = {
      onInstanceCreated: vi.fn(),
    };
    build();
    expect(mockWindow).toEqual({
      alloy1,
      alloy2,
      __alloyNS: ["alloy1", "alloy2"],
      __alloyMonitors: [
        {
          onInstanceCreated: expect.any(Function),
          onInstanceConfigured: expect.any(Function),
          onBeforeCommand: expect.any(Function),
        },
      ],
    });
    expect(mockWindow.__alloyMonitors.length).toBe(1);
    instanceManager.addMonitor(monitor);
    expect(mockWindow.__alloyMonitors.length).toBe(2);
    expect(mockWindow).toEqual({
      alloy1,
      alloy2,
      __alloyNS: ["alloy1", "alloy2"],
      __alloyMonitors: [
        {
          onInstanceCreated: expect.any(Function),
          onInstanceConfigured: expect.any(Function),
          onBeforeCommand: expect.any(Function),
        },
        {
          onInstanceCreated: expect.any(Function),
        },
      ],
    });
  });

  it("configures an SDK instance for each configured instance", () => {
    build();
    expect(alloy1).toHaveBeenCalledWith("configure", {
      datastreamId: "PR123",
      debugEnabled: false,
      orgId: "ABC@AdobeOrg",
      onBeforeEventSend: expect.any(Function),
      edgeConfigOverrides: undefined,
    });
    expect(alloy2).toHaveBeenCalledWith("configure", {
      datastreamId: "PR456",
      debugEnabled: false,
      orgId: "DIFFERENTORG@AdobeOrg",
      onBeforeEventSend: expect.any(Function),
      edgeConfigOverrides: undefined,
    });
  });

  it("configures SDK instance with debugging enabled if Launch debugging is enabled", () => {
    turbine.debugEnabled = true;
    build();
    expect(alloy1).toHaveBeenCalledWith("configure", {
      datastreamId: "PR123",
      debugEnabled: true,
      orgId: "ABC@AdobeOrg",
      onBeforeEventSend: expect.any(Function),
      edgeConfigOverrides: undefined,
    });
  });

  it("toggles SDK debugging when Launch debugging is toggled", () => {
    const onDebugChangedCallbacks = [];
    turbine.onDebugChanged.mockImplementation((callback) => {
      onDebugChangedCallbacks.push(callback);
    });
    build();
    onDebugChangedCallbacks.forEach((callback) => callback(true));
    expect(alloy1).toHaveBeenCalledWith("setDebug", {
      enabled: true,
    });
    onDebugChangedCallbacks.forEach((callback) => callback(false));
    expect(alloy1).toHaveBeenCalledWith("setDebug", {
      enabled: false,
    });
  });

  it("returns instance by name", () => {
    build();
    const instance = instanceManager.getInstance("alloy2");
    expect(instance).toBe(alloy2);
  });

  it("creates an event merge ID", () => {
    createEventMergeId = vi.fn().mockReturnValue("randomEventMergeId");
    build();
    const eventMergeId = instanceManager.createEventMergeId();
    expect(eventMergeId).toBe("randomEventMergeId");
  });

  it("handles a staging environment", () => {
    turbine.environment.stage = "staging";
    build();
    expect(alloy1.mock.calls[0][1].datastreamId).toBe("PR123:stage");
    expect(alloy2.mock.calls[0][1].datastreamId).toBe("PR456");
  });

  it("handles a development environment", () => {
    turbine.environment.stage = "development";
    build();
    expect(alloy1.mock.calls[0][1].datastreamId).toBe("PR123:dev");
    expect(alloy2.mock.calls[0][1].datastreamId).toBe("PR456");
  });

  it("wraps onBeforeEventSend", () => {
    build();
    const { onBeforeEventSend: configuredOnBeforeEventSend } =
      alloy1.mock.calls[0][1];
    expect(configuredOnBeforeEventSend).toBe(onBeforeEventSend);
  });

  it("handles config overrides", () => {
    turbine.environment.stage = "development";
    getConfigOverrides.mockReturnValue({
      com_adobe_target: { propertyToken: "development-property-token" },
    });
    build();
    const { edgeConfigOverrides } = alloy1.mock.calls[0][1];
    expect(edgeConfigOverrides).toEqual({
      com_adobe_target: { propertyToken: "development-property-token" },
    });
  });

  it("flushes queued commands after configuration", async () => {
    const resolvedValue1 = { result: "success1" };
    const resolvedValue2 = { result: "success2" };
    const resolve1 = vi.fn();
    const resolve2 = vi.fn();
    const reject1 = vi.fn();
    const reject2 = vi.fn();

    mockWindow.alloy1 = {
      q: [
        [resolve1, reject1, ["sendEvent", { xdm: { test: 1 } }]],
        [resolve2, reject2, ["getIdentity"]],
      ],
    };

    alloy1
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(resolvedValue1)
      .mockResolvedValueOnce(resolvedValue2);

    build();

    expect(alloy1).toHaveBeenCalledWith("configure", expect.any(Object));
    expect(alloy1).toHaveBeenCalledWith("sendEvent", { xdm: { test: 1 } });
    expect(alloy1).toHaveBeenCalledWith("getIdentity");

    await vi.waitFor(() => {
      expect(resolve1).toHaveBeenCalledWith(resolvedValue1);
      expect(resolve2).toHaveBeenCalledWith(resolvedValue2);
    });

    expect(reject1).not.toHaveBeenCalled();
    expect(reject2).not.toHaveBeenCalled();
  });

  it("handles errors in queued commands", async () => {
    const error = new Error("Command failed");
    const resolve1 = vi.fn();
    const reject1 = vi.fn();

    mockWindow.alloy1 = {
      q: [[resolve1, reject1, ["sendEvent", { xdm: { test: 1 } }]]],
    };

    alloy1.mockResolvedValueOnce(undefined).mockRejectedValueOnce(error);

    build();

    await vi.waitFor(() => {
      expect(reject1).toHaveBeenCalledWith(error);
    });

    expect(resolve1).not.toHaveBeenCalled();
  });

  it("handles empty queue when no commands were queued", () => {
    mockWindow.alloy1 = {
      q: [],
    };

    alloy1.mockResolvedValueOnce(undefined);

    build();

    expect(alloy1).toHaveBeenCalledWith("configure", expect.any(Object));
    expect(alloy1).toHaveBeenCalledTimes(1);
  });

  it("handles missing queue when window[name] does not exist", () => {
    alloy1.mockResolvedValueOnce(undefined);

    build();

    expect(alloy1).toHaveBeenCalledWith("configure", expect.any(Object));
    expect(alloy1).toHaveBeenCalledTimes(1);
  });

  describe("when libraryCode.type is preinstalled", () => {
    beforeEach(() => {
      alloy3 = vi.fn();
      extensionSettings.libraryCode = { type: PREINSTALLED };
      extensionSettings.instances = [
        {
          name: "alloy3",
        },
      ];
    });

    it("creates instance using createCustomInstance", () => {
      build();

      // In preinstalled mode, createCustomInstance should be called
      expect(createCustomInstance).toHaveBeenCalledWith({
        name: "alloy3",
        components: undefined,
      });

      // The instance should be registered
      const instance = instanceManager.getInstance("alloy3");
      expect(instance).toBe(alloy3);
    });

    it("does not configure the instance in preinstalled mode", () => {
      build();

      // createCustomInstance returns the proxy/instance
      const instance = instanceManager.getInstance("alloy3");
      expect(instance).toBe(alloy3);

      // Should NOT call configure since it's preinstalled
      expect(alloy3).not.toHaveBeenCalledWith("configure", expect.any(Object));
    });

    it("does not add instance to window.__alloyNS in preinstalled mode", () => {
      build();

      // In preinstalled mode, we don't add instance name to __alloyNS
      // The external instance already exists on window
      // eslint-disable-next-line no-underscore-dangle
      expect(mockWindow.__alloyNS).toBeDefined();
      // eslint-disable-next-line no-underscore-dangle
      expect(mockWindow.__alloyNS).not.toContain("alloy3");
    });

    it("does not set instance on window in preinstalled mode", () => {
      build();

      // In preinstalled mode, we don't overwrite window[name]
      // The external instance should already be there
      expect(mockWindow.alloy3).toBeUndefined();
    });
  });

  describe("when libraryCode.type is managed", () => {
    beforeEach(() => {
      alloy3 = vi.fn();
      extensionSettings.libraryCode = { type: MANAGED };
      extensionSettings.instances.push({
        name: "alloy3",
        edgeConfigId: "PR789",
      });
    });

    it("creates and configures instance in managed mode", () => {
      build();

      expect(createCustomInstance).toHaveBeenCalledWith({
        name: "alloy3",
        components: undefined,
      });
      expect(alloy3).toHaveBeenCalledWith("configure", expect.any(Object));

      const instance = instanceManager.getInstance("alloy3");
      expect(instance).toBe(alloy3);
    });

    it("adds instance to window.__alloyNS in managed mode", () => {
      build();

      // eslint-disable-next-line no-underscore-dangle
      expect(mockWindow.__alloyNS).toContain("alloy3");
    });

    it("sets instance on window in managed mode", () => {
      build();

      expect(mockWindow.alloy3).toBe(alloy3);
    });
  });
});
