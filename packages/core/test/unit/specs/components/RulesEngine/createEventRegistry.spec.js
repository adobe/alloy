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
import createEventRegistry from "../../../../../src/components/RulesEngine/createEventRegistry.js";

describe("RulesEngine:createEventRegistry", () => {
  let storage;
  let mockedTimestamp;

  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    mockedTimestamp = new Date("2023-05-24T08:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockedTimestamp);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("registers events", () => {
    const eventRegistry = createEventRegistry({
      storage,
      logger: { info: vi.fn() },
    });

    const getContent = () => ({
      xdm: {
        eventType: "decisioning.propositionDisplay",
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "111",
                scope: "mobileapp://com.adobe.aguaAppIos",
                scopeDetails: {
                  decisionProvider: "AJO",
                  correlationID: "ccaa539e-ca14-4d42-ac9a-0a17e69a63e4",
                  activity: {
                    id: "111#aaa",
                  },
                },
              },
              {
                id: "222",
                scope: "mobileapp://com.adobe.aguaAppIos",
                scopeDetails: {
                  decisionProvider: "AJO",
                  correlationID: "ccaa539e-ca14-4d42-ac9a-0a17e69a63e4",
                  activity: {
                    id: "222#bbb",
                  },
                },
              },
              {
                id: "333",
                scope: "web://something",
                scopeDetails: {
                  decisionProvider: "TGT",
                  correlationID: "aasfsdf",
                  activity: {
                    id: "333#ccc",
                  },
                },
              },
            ],
            propositionEventType: {
              display: 1,
            },
          },
        },
      },
    });

    const event = {
      getContent,
    };

    eventRegistry.addExperienceEdgeEvent(event);

    expect(eventRegistry.toJSON()).toEqual({
      c0d80871: {
        timestamps: [expect.any(Number)],
      },
      f1173131: {
        timestamps: [expect.any(Number)],
      },
    });
  });

  it("does not register invalid events", () => {
    const eventRegistry = createEventRegistry({
      storage,
    });
    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
        },
      }),
    });
    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {},
        },
      }),
    });
    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {
            decisioning: {},
          },
        },
      }),
    });
    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({}),
    });
    expect(eventRegistry.toJSON()).toEqual({});
  });

  it("does not register events without type and id", () => {
    const eventRegistry = createEventRegistry({
      storage,
    });

    expect(eventRegistry.addEvent({ eventType: "trigger" })).toBeUndefined();

    expect(
      eventRegistry.addEvent({ eventType: "trigger", eventId: undefined }),
    ).toBeUndefined();

    expect(eventRegistry.addEvent()).toBeUndefined();

    expect(eventRegistry.toJSON()).toEqual({});
  });

  it("adds new timestamp for every call", () => {
    const eventRegistry = createEventRegistry({
      storage,
      logger: { info: vi.fn() },
    });

    const getContent = () => ({
      xdm: {
        eventType: "decisioning.propositionDisplay",
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "111",
                scope: "mobileapp://com.adobe.aguaAppIos",
                scopeDetails: {
                  decisionProvider: "AJO",
                  correlationID: "ccaa539e-ca14-4d42-ac9a-0a17e69a63e4",
                  activity: {
                    id: "111#aaa",
                  },
                },
              },
            ],
            propositionEventType: {
              display: 1,
            },
          },
        },
      },
    });

    const event = {
      getContent,
    };

    let lastEventTime = 0;

    eventRegistry.addExperienceEdgeEvent(event);

    expect(eventRegistry.getEvent("display", "111#aaa")).toEqual({
      timestamps: [expect.any(Number)],
    });

    expect(
      eventRegistry.getEvent("display", "111#aaa").timestamps[0],
    ).toBeGreaterThan(lastEventTime);
    lastEventTime = eventRegistry.getEvent("display", "111#aaa").timestamps[0];

    setTimeout(() => {
      eventRegistry.addExperienceEdgeEvent(event); // again

      expect(eventRegistry.getEvent("display", "111#aaa")).toEqual({
        timestamps: expect.arrayContaining([expect.any(Number)]),
      });

      expect(
        eventRegistry.getEvent("display", "111#aaa").timestamps[1],
      ).toBeGreaterThan(lastEventTime);
    }, 50);

    vi.advanceTimersByTime(60);
  });

  it("does not add duplicate events when operation is insertIfNotExists", () => {
    const eventRegistry = createEventRegistry({
      storage,
      logger: { info: vi.fn() },
    });

    const event = { eventType: "trigger", eventId: "123" };

    eventRegistry.addEvent(event, "insertIfNotExists");
    eventRegistry.addEvent(event, "insertIfNotExists");

    expect(eventRegistry.toJSON()).toEqual({
      "435c27de": {
        timestamps: [expect.any(Number)],
      },
    });
  });
});
