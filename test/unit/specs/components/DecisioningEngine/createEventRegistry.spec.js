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
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:createEventRegistry", () => {
  it("registers events", () => {
    const eventRegistry = createEventRegistry();

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

    eventRegistry.rememberEvent(event);

    expect(eventRegistry.toJSON()).toEqual({
      abc: {
        event: { id: "abc", type: "display" },
        timestamp: jasmine.any(Number),
        count: 1
      },
      def: {
        event: { id: "def", type: "display" },
        timestamp: jasmine.any(Number),
        count: 1
      },
      ghi: {
        event: { id: "ghi", type: "display" },
        timestamp: jasmine.any(Number),
        count: 1
      }
    });
  });

  it("does not register invalid events", () => {
    const eventRegistry = createEventRegistry();

    eventRegistry.rememberEvent({
      getContent: () => ({
        xdm: {
          eventType: "display"
        }
      })
    });
    eventRegistry.rememberEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {}
        }
      })
    });
    eventRegistry.rememberEvent({
      getContent: () => ({
        xdm: {
          eventType: "display",
          _experience: {
            decisioning: {}
          }
        }
      })
    });
    eventRegistry.rememberEvent({
      getContent: () => ({})
    });

    expect(eventRegistry.toJSON()).toEqual({});
  });

  it("increments count and sets timestamp", done => {
    const eventRegistry = createEventRegistry();

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
    eventRegistry.rememberEvent(event);

    expect(eventRegistry.getEvent("abc")).toEqual({
      event: { id: "abc", type: "display" },
      timestamp: jasmine.any(Number),
      count: 1
    });
    expect(eventRegistry.getEvent("abc").timestamp).toBeGreaterThan(
      lastEventTime
    );
    lastEventTime = eventRegistry.getEvent("abc").timestamp;

    setTimeout(() => {
      eventRegistry.rememberEvent(event); // again

      expect(eventRegistry.getEvent("abc")).toEqual({
        event: { id: "abc", type: "display" },
        timestamp: jasmine.any(Number),
        count: 2
      });
      expect(eventRegistry.getEvent("abc").timestamp).toBeGreaterThan(
        lastEventTime
      );
      done();
    }, 10);
  });
});
