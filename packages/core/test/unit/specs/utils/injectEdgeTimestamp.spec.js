/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import injectEdgeTimestamp from "../../../../src/utils/injectEdgeTimestamp.js";
import createEvent from "../../../../src/core/createEvent.js";

describe("injectEdgeTimestamp", () => {
  const clientTime = new Date("2026-03-04T05:06:07.890Z");

  const stampedXdm = (config) => {
    const event = createEvent();
    event.setUserXdm({ eventType: "test" });
    injectEdgeTimestamp(config, () => clientTime)(event);
    event.finalize();
    return event.toJSON().xdm;
  };

  it("sets the client time by default", () => {
    expect(stampedXdm({ context: ["web"] }).timestamp).toBe(
      "2026-03-04T05:06:07.890Z",
    );
  });

  it("leaves the timestamp out when serverSideTimestamp is configured", () => {
    expect(stampedXdm({ context: ["serverSideTimestamp"] })).not.toHaveProperty(
      "timestamp",
    );
  });
});
