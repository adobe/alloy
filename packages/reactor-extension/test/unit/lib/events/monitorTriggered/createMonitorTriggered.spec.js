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
import createMonitorTriggered from "../../../../../src/lib/events/monitor/createMonitorTriggered";

describe("Monitor triggered event", () => {
  let trigger;
  let monitorTriggered;
  let instanceManager;

  beforeEach(() => {
    trigger = vi.fn();
    instanceManager = {
      addMonitor: vi.fn(),
    };

    monitorTriggered = createMonitorTriggered({
      instanceManager,
    });
  });

  it("triggers the rule when monitor is triggered", () => {
    monitorTriggered({ name: "onBeforeLog" }, trigger);
    expect(instanceManager.addMonitor).toHaveBeenCalledTimes(1);

    // Get the callback that was passed to addMonitor
    const callback = instanceManager.addMonitor.mock.calls[0][0].onBeforeLog;
    const data = { status: "success" };
    callback({ data });

    expect(trigger).toHaveBeenCalledWith({ data });
  });
});
