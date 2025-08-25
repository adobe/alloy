/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import createEventPruner from "../../../../../../packages/core/src/components/RulesEngine/utils/createEventPruner.js";
import generateEventHash from "../../../../../../packages/core/src/components/RulesEngine/utils/generateEventHash.js";

describe("RulesEngine:createEventRegistry", () => {
  const mockedTimestamp = new Date("2023-05-24T08:00:00Z");

  it("limits events to the number of configured events", () => {
    const prune = createEventPruner(30, 2);
    const events = {};
    let hash;

    let validTimestamp = new Date().getTime();

    // Generate a few expired events (have a timestamp older than 30 days).
    for (let i = 0; i < 2; i += 1) {
      hash = generateEventHash({
        "iam.id": i,
        "iam.eventType": "decisioning.propositionDisplay",
      });
      events[hash] = { timestamps: [validTimestamp++] };

      hash = generateEventHash({
        "iam.id": i,
        "iam.eventType": "decisioning.propositionInteract",
      });
      events[hash] = { timestamps: [validTimestamp++] };
    }

    expect(Object.keys(events).length).toBe(4);

    const prunedEvents = prune(events);
    expect(Object.keys(prunedEvents).length).toBe(2);
  });

  it("should filter events based on expiration date", () => {
    const prune = createEventPruner(30, 1000);
    const events = {};
    let hash;

    // Generate a few expired events (have a timestamp older than 30 days).
    for (let i = 0; i < 2; i += 1) {
      hash = generateEventHash({
        "iam.id": i,
        "iam.eventType": "decisioning.propositionDisplay",
      });
      events[hash] = { timestamps: [mockedTimestamp] };

      hash = generateEventHash({
        "iam.id": i,
        "iam.eventType": "decisioning.propositionInteract",
      });
      events[hash] = { timestamps: [mockedTimestamp] };
    }

    const validTimestamp = new Date().getTime();
    hash = generateEventHash({
      "iam.id": 100,
      "iam.eventType": "decisioning.propositionInteract",
    });
    events[hash] = { timestamps: [mockedTimestamp, validTimestamp] };

    expect(Object.keys(events).length).toBe(5);

    const prunedEvents = prune(events);
    expect(Object.keys(prunedEvents).length).toBe(1);
    expect(prunedEvents[hash].timestamps[0]).toBe(validTimestamp);
  });
});
