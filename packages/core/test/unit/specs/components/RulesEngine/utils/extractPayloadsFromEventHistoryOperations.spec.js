/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";

import extractPayloadsFromEventHistoryOperations from "../../../../../../src/components/RulesEngine/utils/extractPayloadsFromEventHistoryOperations.js";
import { EVENT_HISTORY_OPERATION } from "../../../../../../src/constants/schema.js";

describe("extractPayloadsFromEventHistoryOperations", () => {
  it("should return empty array for empty proposition list", () => {
    const result = extractPayloadsFromEventHistoryOperations([]);
    expect(result).toEqual([]);
  });

  it("should return empty array when no event history operations exist", () => {
    const propositionList = [
      {
        id: "prop1",
        items: [
          {
            schema: "some-other-schema",
            data: { someData: "value" },
          },
        ],
      },
    ];

    const result = extractPayloadsFromEventHistoryOperations(propositionList);
    expect(result).toEqual([]);
    expect(propositionList[0].items.length).toBe(1); // Original items should remain unchanged
  });

  it("should extract event history operations and modify proposition list", () => {
    const propositionList = [
      {
        id: "prop1",
        items: [
          {
            schema: EVENT_HISTORY_OPERATION,
            data: {
              operation: "insert",
              content: {
                "iam.id": "event123",
                "iam.eventType": "click",
              },
            },
          },
          {
            schema: "some-other-schema",
            data: { someData: "value" },
          },
        ],
      },
    ];

    const expectedPayloads = [
      {
        operation: "insert",
        event: {
          eventId: "event123",
          eventType: "click",
        },
      },
    ];

    const result = extractPayloadsFromEventHistoryOperations(propositionList);

    expect(result).toEqual(expectedPayloads);
    expect(propositionList[0].items.length).toBe(1); // One item should be removed
    expect(propositionList[0].items[0].schema).toBe("some-other-schema");
  });

  it("should handle multiple propositions with mixed items", () => {
    const propositionList = [
      {
        id: "prop1",
        items: [
          {
            schema: EVENT_HISTORY_OPERATION,
            data: {
              operation: "insert",
              content: {
                "iam.id": "event123",
                "iam.eventType": "click",
              },
            },
          },
          {
            schema: "regular-item",
            data: { someData: "value1" },
          },
        ],
      },
      {
        id: "prop2",
        items: [
          {
            schema: "regular-item",
            data: { someData: "value2" },
          },
        ],
      },
      {
        id: "prop3",
        items: [
          {
            schema: EVENT_HISTORY_OPERATION,
            data: {
              operation: "insertIfNotExists",
              content: {
                "iam.id": "event456",
                "iam.eventType": "view",
              },
            },
          },
        ],
      },
    ];

    const expectedPayloads = [
      {
        operation: "insert",
        event: {
          eventId: "event123",
          eventType: "click",
        },
      },
      {
        operation: "insertIfNotExists",
        event: {
          eventId: "event456",
          eventType: "view",
        },
      },
    ];

    const result = extractPayloadsFromEventHistoryOperations(propositionList);

    expect(result).toEqual(expectedPayloads);
    expect(propositionList[0].items.length).toBe(1);
    expect(propositionList[1].items.length).toBe(1);
    expect(propositionList[2].items.length).toBe(0); // All items removed from prop3
  });

  it("should handle proposition with all event history operations", () => {
    const propositionList = [
      {
        id: "prop1",
        items: [
          {
            schema: EVENT_HISTORY_OPERATION,
            data: {
              operation: "insert",
              content: {
                "iam.id": "event123",
                "iam.eventType": "click",
              },
            },
          },
          {
            schema: EVENT_HISTORY_OPERATION,
            data: {
              operation: "insert",
              content: {
                "iam.id": "event456",
                "iam.eventType": "view",
              },
            },
          },
        ],
      },
    ];

    const result = extractPayloadsFromEventHistoryOperations(propositionList);

    expect(result.length).toBe(2);
    expect(propositionList[0].items.length).toBe(0); // All items should be removed
  });
});
