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
import createEventRegistry, {
  createEventPruner
} from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:createEventRegistry", () => {
  let storage;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
  });

  it("registers events", () => {
    const eventRegistry = createEventRegistry({ storage });

    const getContent = () => ({
      xdm: {
        eventType: "display",
        _experience: {
          decisioning: {
            propositions: [{ id: "abc" }, { id: "def" }, { id: "ghi" }]
          }
        }
      }
    });

    const event = {
      getContent
    };

    eventRegistry.addExperienceEdgeEvent(event);

    expect(eventRegistry.toJSON()).toEqual({
      display: {
        abc: {
          event: jasmine.objectContaining({ id: "abc", type: "display" }),
          firstTimestamp: jasmine.any(Number),
          timestamp: jasmine.any(Number),
          count: 1
        },
        def: {
          event: jasmine.objectContaining({ id: "def", type: "display" }),
          firstTimestamp: jasmine.any(Number),
          timestamp: jasmine.any(Number),
          count: 1
        },
        ghi: {
          event: jasmine.objectContaining({ id: "ghi", type: "display" }),
          firstTimestamp: jasmine.any(Number),
          timestamp: jasmine.any(Number),
          count: 1
        }
      }
    });
  });

  it("does not register invalid events", () => {
    const eventRegistry = createEventRegistry({ storage });

    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({
        xdm: {
          eventType: "display"
        }
      })
    });
    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {}
        }
      })
    });
    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {
            decisioning: {}
          }
        }
      })
    });
    eventRegistry.addExperienceEdgeEvent({
      getContent: () => ({})
    });

    expect(eventRegistry.toJSON()).toEqual({});
  });

  it("increments count and sets timestamp", done => {
    const eventRegistry = createEventRegistry({ storage, saveDelay: 10 });

    const getContent = () => ({
      xdm: {
        eventType: "display",
        _experience: {
          decisioning: {
            propositions: [{ id: "abc" }]
          }
        }
      }
    });

    const event = {
      getContent
    };
    let lastEventTime = 0;
    eventRegistry.addExperienceEdgeEvent(event);

    expect(eventRegistry.getEvent("display", "abc")).toEqual({
      event: jasmine.objectContaining({ id: "abc", type: "display" }),
      firstTimestamp: jasmine.any(Number),
      timestamp: jasmine.any(Number),
      count: 1
    });
    expect(eventRegistry.getEvent("display", "abc").timestamp).toBeGreaterThan(
      lastEventTime
    );
    lastEventTime = eventRegistry.getEvent("display", "abc").timestamp;

    setTimeout(() => {
      eventRegistry.addExperienceEdgeEvent(event); // again

      expect(eventRegistry.getEvent("display", "abc")).toEqual({
        event: jasmine.objectContaining({ id: "abc", type: "display" }),
        firstTimestamp: jasmine.any(Number),
        timestamp: jasmine.any(Number),
        count: 2
      });
      expect(
        eventRegistry.getEvent("display", "abc").timestamp
      ).toBeGreaterThan(lastEventTime);
      done();
    }, 50);
  });

  it("limits events to 1000 events", () => {
    const prune = createEventPruner();

    const events = {};
    events["decisioning.propositionDisplay"] = {};
    events["decisioning.propositionInteract"] = {};

    for (let i = 0; i < 2000; i += 1) {
      events["decisioning.propositionDisplay"][i] = {
        event: {
          id: i,
          type: "decisioning.propositionDisplay"
        },
        firstTimestamp: 1,
        timestamp: 1,
        count: 1
      };

      events["decisioning.propositionInteract"][i] = {
        event: {
          id: i,
          type: "decisioning.propositionInteract"
        },
        firstTimestamp: 1,
        timestamp: 1,
        count: 1
      };

      const pruned = prune(events);

      const interactEvents = Object.values(
        pruned["decisioning.propositionInteract"]
      );

      const displayEvents = Object.values(
        pruned["decisioning.propositionDisplay"]
      );

      expect(interactEvents.length).not.toBeGreaterThan(1000);
      expect(displayEvents.length).not.toBeGreaterThan(1000);

      if (i > 1000) {
        expect(interactEvents[0].event.id).toEqual(i - 999);
        expect(displayEvents[0].event.id).toEqual(i - 999);
      }

      if (i > 0) {
        expect(
          interactEvents[0].timestamp <
            interactEvents[interactEvents.length - 1].timestamp
        );
        expect(
          displayEvents[0].timestamp <
            displayEvents[interactEvents.length - 1].timestamp
        );
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
          id: i,
          type: "decisioning.propositionDisplay"
        },
        firstTimestamp: 1,
        timestamp: 1,
        count: 1
      };

      const pruned = prune(events);

      const displayEvents = Object.values(
        pruned["decisioning.propositionDisplay"]
      );

      expect(displayEvents.length).not.toBeGreaterThan(10);
    }
  });
});
