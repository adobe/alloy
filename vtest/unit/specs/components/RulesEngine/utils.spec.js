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
import { vi, beforeEach, describe, it, expect } from "vitest";
import {
  createInMemoryStorage,
  createRestoreStorage,
  createSaveStorage,
  getActivityId,
  getExpirationDate,
} from "../../../../../src/components/RulesEngine/utils.js";

describe("RulesEngine:utils", () => {
  let storage;
  let inMemoryStorage;
  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    inMemoryStorage = createInMemoryStorage();
  });
  it("restores from storage", () => {
    storage.getItem.mockReturnValue(
      '{ "something": true, "color": "orange", "person": { "height": 5.83 } }',
    );
    const restore = createRestoreStorage(storage, "zoink");
    expect(
      restore({
        good: true,
      }),
    ).toEqual({
      something: true,
      color: "orange",
      person: {
        height: 5.83,
      },
    });
    expect(storage.getItem).toHaveBeenCalledWith("zoink");
  });
  it("uses default value if storage unavailable", () => {
    storage.getItem.mockReturnValue(undefined);
    const restore = createRestoreStorage(storage, "zoink");
    expect(
      restore({
        good: true,
      }),
    ).toEqual({
      good: true,
    });
    expect(storage.getItem).toHaveBeenCalledWith("zoink");
  });
  it("saves to storage", () => {
    const mockedTimestamp = new Date(Date.UTC(2023, 8, 2, 13, 34, 56));
    vi.useFakeTimers();
    vi.setSystemTime(mockedTimestamp);

    storage.getItem.mockReturnValue(
      '{ "something": true, "color": "orange", "person": { "height": 5.83 } }',
    );
    const save = createSaveStorage(storage, "zoink");
    save({
      something: true,
      color: "orange",
      person: {
        height: 5.83,
      },
    });

    vi.advanceTimersByTime(60);

    expect(storage.setItem).toHaveBeenCalledWith(
      "zoink",
      '{"something":true,"color":"orange","person":{"height":5.83}}',
    );

    vi.useRealTimers();
  });
  it("should return the date of expiration", () => {
    const mockedTimestamp = new Date(Date.UTC(2023, 8, 2, 13, 34, 56));
    vi.useFakeTimers();
    vi.setSystemTime(mockedTimestamp);

    const retentionPeriod = 10;
    const expectedDate = new Date(mockedTimestamp);
    expectedDate.setDate(expectedDate.getDate() - retentionPeriod);
    const result = getExpirationDate(retentionPeriod);
    expect(result).toEqual(expectedDate);

    vi.useRealTimers();
  });
  it("should return the activityId", () => {
    const proposition = {
      id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
      scope: "web://mywebsite.com",
      scopeDetails: {
        decisionProvider: "AJO",
        characteristics: {
          eventToken: "abc",
        },
        strategies: [
          {
            strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
            treatmentID: "yu7rkogezumca7i0i44v",
          },
        ],
        activity: {
          id: "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183",
        },
        correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
      },
      items: [
        {
          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
          schema: "https://ns.adobe.com/personalization/ruleset-item",
          data: {
            version: 1,
            rules: [
              {
                condition: {
                  definition: {
                    conditions: [
                      {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                key: "color",
                                matcher: "eq",
                                values: ["orange", "blue"],
                              },
                              type: "matcher",
                            },
                            {
                              definition: {
                                key: "action",
                                matcher: "eq",
                                values: ["lipstick"],
                              },
                              type: "matcher",
                            },
                          ],
                          logic: "and",
                        },
                        type: "group",
                      },
                    ],
                    logic: "and",
                  },
                  type: "group",
                },
                consequences: [
                  {
                    type: "schema",
                    detail: {
                      schema: "https://ns.adobe.com/personalization/dom-action",
                      data: {
                        selector:
                          "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                        type: "setAttribute",
                        content: {
                          src: "img/demo-marketing-offer1-exp-A.png",
                        },
                        prehidingSelector:
                          "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                      },
                      id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
                    },
                    id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
                  },
                ],
              },
            ],
          },
        },
      ],
    };
    expect(getActivityId(proposition)).toEqual(
      "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183",
    );
  });
  it("should return the activityId as undefined", () => {
    const proposition = {
      id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
      scope: "web://mywebsite.com",
      scopeDetails: {
        decisionProvider: "AJO",
        characteristics: {
          eventToken: "abc",
        },
        strategies: [
          {
            strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
            treatmentID: "yu7rkogezumca7i0i44v",
          },
        ],
        correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
      },
    };
    expect(getActivityId(proposition)).toEqual(undefined);
  });
  it("should set and retrieve an item from in-memory storage", () => {
    const key = "testKey";
    const value = "testValue";
    inMemoryStorage.setItem(key, value);
    const retrievedValue = inMemoryStorage.getItem(key);
    expect(retrievedValue).toEqual(value);
  });
  it("should return null for a non-existent item", () => {
    const key = "nonExistentKey";
    const retrievedValue = inMemoryStorage.getItem(key);
    expect(retrievedValue).toBeNull();
  });
  it("should overwrite the value for an existing key", () => {
    const key = "existingKey";
    const originalValue = "originalValue";
    const updatedValue = "updatedValue";
    inMemoryStorage.setItem(key, originalValue);
    inMemoryStorage.setItem(key, updatedValue);
    const retrievedValue = inMemoryStorage.getItem(key);
    expect(retrievedValue).toEqual(updatedValue);
  });
});
