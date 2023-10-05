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
import createIndexedDB from "../../../../../src/components/DecisioningEngine/createIndexedDB";

describe("DecisioningEngine:createEventRegistry", () => {
  let eventRegistry;
  let mockedTimestamp;
  let indexedDB;

  beforeAll(async () => {
    indexedDB = createIndexedDB();
    await indexedDB.setupIndexedDB();
    eventRegistry = createEventRegistry({ indexedDB });
    mockedTimestamp = new Date("2023-05-24T08:00:00Z");
    jasmine.clock().install();
    jasmine.clock().mockDate(mockedTimestamp);
  });

  afterAll(async () => {
    await indexedDB.clearIndexedDB();
    indexedDB.getIndexDB().close();
    jasmine.clock().uninstall();
  });

  it("should add an event to the database", async () => {
    const eventType = "trigger";
    const eventId = "abc123";
    const action = "click";

    const result = await eventRegistry.addEvent({}, eventType, eventId, action);
    expect(result).toBeTruthy();
  });

  it("should get events from the database if that exist", async () => {
    const eventType = "trigger";
    const eventId = "abc123";

    const events = await eventRegistry.getEvents(eventType, eventId);
    expect(Array.isArray(events)).toBe(true);
  });

  it("should return empty if the query is not found", async () => {
    const eventType = "someMagicalEvent";
    const eventId = "someFutureId";

    const events = await eventRegistry.getEvents(eventType, eventId);
    expect(events.length).toBe(0);
  });
  // TODO: FIX the below test
  // it("should get the first timestamp for events", async () => {
  //   const eventType = "trigger";
  //   const eventId = "abc123";
  //
  //   const timestamp = await eventRegistry.getEventsFirstTimestamp(
  //     eventType,
  //     eventId
  //   );
  //   expect(timestamp).toBe(mockedTimestamp.getTime());
  // });

  it("should add experience edge event to the database", async () => {
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
                    id: "111#aaa"
                  }
                }
              },
              {
                id: "222",
                scope: "mobileapp://com.adobe.aguaAppIos",
                scopeDetails: {
                  decisionProvider: "AJO",
                  correlationID: "ccaa539e-ca14-4d42-ac9a-0a17e69a63e4",
                  activity: {
                    id: "222#bbb"
                  }
                }
              }
            ],
            propositionEventType: {
              display: 1
            }
          }
        }
      }
    });

    const mockEvent = {
      getContent
    };

    await eventRegistry.addExperienceEdgeEvent(mockEvent);

    const eventType = "display";
    const eventId1 = "111#aaa";

    const events1 = await eventRegistry.getEvents(eventType, eventId1);
    expect(events1.length).toBeGreaterThan(0);
  });
});
