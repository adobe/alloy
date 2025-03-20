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
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import createEventPruner from "../../../../../../src/components/RulesEngine/utils/createEventPruner.js";

describe("RulesEngine:createEventRegistry", () => {
  let mockedTimestamp;

  beforeEach(() => {
    mockedTimestamp = new Date("2023-05-24T08:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockedTimestamp);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("limits events to 1000 events", () => {
    const prune = createEventPruner();
    const events = {};

    events["decisioning.propositionDisplay"] = {};
    events["decisioning.propositionInteract"] = {};

    for (let i = 0; i < 2000; i += 1) {
      events["decisioning.propositionDisplay"][i] = {
        event: {
          "iam.id": i,
          "iam.eventType": "decisioning.propositionDisplay",
        },
        firstTimestamp: "2023-05-23T08:00:00Z",
        timestamp: mockedTimestamp,
        count: 1,
      };

      events["decisioning.propositionInteract"][i] = {
        event: {
          "iam.id": i,
          "iam.eventType": "decisioning.propositionInteract",
        },
        firstTimestamp: "2023-05-23T08:00:00Z",
        timestamp: mockedTimestamp,
        count: 1,
      };

      const pruned = prune(events);
      const interactEvents = Object.values(
        pruned["decisioning.propositionInteract"],
      );

      const displayEvents = Object.values(
        pruned["decisioning.propositionDisplay"],
      );

      expect(interactEvents.length).not.toBeGreaterThan(1000);

      expect(displayEvents.length).not.toBeGreaterThan(1000);

      if (i > 1000) {
        expect(interactEvents[0].event["iam.id"]).toEqual(i - 999);
        expect(displayEvents[0].event["iam.id"]).toEqual(i - 999);
      }

      if (i > 0) {
        expect(
          interactEvents[0].timestamp <
            interactEvents[interactEvents.length - 1].timestamp,
        ).toBe(false);

        expect(
          displayEvents[0].timestamp <
            displayEvents[interactEvents.length - 1].timestamp,
        ).toBe(false);
      }
    }
  });

  it("has configurable limits", () => {
    const prune = createEventPruner(10);
    const events = {};
    events["decisioning.propositionDisplay"] = {};

    for (let i = 0; i < 20; i += 1) {
      events["decisioning.propositionDisplay"][i] = {
        event: {
          "iam.id": i,
          "iam.eventType": "decisioning.propositionDisplay",
        },
        firstTimestamp: 1,
        timestamp: 1,
        count: 1,
      };
      const pruned = prune(events);
      const displayEvents = Object.values(
        pruned["decisioning.propositionDisplay"],
      );

      expect(displayEvents.length).not.toBeGreaterThan(10);
    }
  });

  it("should filter events based on expiration date", () => {
    const pruner = createEventPruner(4, 2);
    const events = {};

    events["decisioning.propositionDisplay"] = {
      1: {
        event: {
          "iam.id": 1,
          "iam.eventType": "decisioning.propositionInteract",
        },
        firstTimestamp: "2023-05-20T10:00:00Z",
        timestamp: mockedTimestamp,
        count: 1,
      },
      2: {
        event: {
          "iam.id": 2,
          "iam.eventType": "decisioning.propositionInteract",
        },
        firstTimestamp: "2023-05-24T15:00:00Z",
        timestamp: mockedTimestamp,
        count: 1,
      },
    };

    events["decisioning.propositionInteract"] = {
      3: {
        event: {
          "iam.id": 3,
          "iam.eventType": "decisioning.propositionInteract",
        },
        firstTimestamp: "2023-05-23T08:00:00Z",
        timestamp: mockedTimestamp,
        count: 1,
      },
      4: {
        event: {
          "iam.id": 4,
          "iam.eventType": "decisioning.propositionInteract",
        },
        firstTimestamp: "2023-05-23T08:00:00Z",
        timestamp: mockedTimestamp,
        count: 1,
      },
    };

    const prunedEvents = pruner(events);

    expect(prunedEvents).toEqual({
      "decisioning.propositionDisplay": {
        2: {
          event: {
            "iam.id": 2,
            "iam.eventType": "decisioning.propositionInteract",
          },
          firstTimestamp: "2023-05-24T15:00:00Z",
          timestamp: mockedTimestamp,
          count: 1,
        },
      },
      "decisioning.propositionInteract": {
        3: {
          event: {
            "iam.id": 3,
            "iam.eventType": "decisioning.propositionInteract",
          },
          firstTimestamp: "2023-05-23T08:00:00Z",
          timestamp: mockedTimestamp,
          count: 1,
        },
        4: {
          event: {
            "iam.id": 4,
            "iam.eventType": "decisioning.propositionInteract",
          },
          firstTimestamp: "2023-05-23T08:00:00Z",
          timestamp: mockedTimestamp,
          count: 1,
        },
      },
    });
  });
});
