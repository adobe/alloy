/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect, beforeEach, vi } from "vitest";
import cleanseIdentityMap from "../../../../../src/lib/dataElements/identityMap/createIdentityMap";

describe("createIdentityMap", () => {
  let logger;
  let identityMap;

  beforeEach(() => {
    logger = {
      log: vi.fn(),
    };
    identityMap = cleanseIdentityMap({
      logger,
    });
  });

  it("returns identity map after removing identifiers without IDs and namespaces without identifiers", () => {
    const input = {
      EMAIL: [
        {
          id: undefined,
          authenticatedState: "loggedOut",
          primary: true,
        },
        {
          id: null,
        },
        {
          id: true,
        },
        {
          id: false,
        },
        {
          id: {},
        },
        {
          id: "",
        },
        {
          id() {},
        },
        {
          id: "example@example.com",
        },
      ],
      PHONE: [
        {
          id: undefined,
          authenticatedState: "authenticated",
        },
      ],
      AAID: [],
      CORE: [
        {
          id: "ABC123",
          authenticatedState: "ambiguous",
        },
      ],
    };
    const result = identityMap(input);

    expect(result).toEqual({
      EMAIL: [
        {
          id: "example@example.com",
        },
      ],
      CORE: [{ id: "ABC123", authenticatedState: "ambiguous" }],
    });

    const expectedLogArgsByCallIndex = [];

    input.EMAIL.forEach((identifier, i) => {
      if (identifier.id !== "example@example.com") {
        expectedLogArgsByCallIndex.push([
          `The identifier at EMAIL[${i}] was removed from the identity map because its ID is not a populated string. Its ID value is:`,
          identifier.id,
        ]);
      }
    });

    expectedLogArgsByCallIndex.push([
      "The identifier at PHONE[0] was removed from the identity map because its ID is not a populated string. Its ID value is:",
      undefined,
    ]);

    expectedLogArgsByCallIndex.push([
      "The PHONE namespace was removed from the identity map because it contains no identifiers.",
    ]);

    expectedLogArgsByCallIndex.push([
      "The AAID namespace was removed from the identity map because it contains no identifiers.",
    ]);

    expect(logger.log).toHaveBeenCalledTimes(10);

    // It's not only important that log() was called with the right arguments, but also
    // that it was called in the right order. For example, for a given namespace, it looks
    // cleaner if the removal of an identifier at index 0 is logged to the console before
    // the removal of an identifier at index 1. This assertion helps ensure we don't implement
    // a reverse loop to slice identifiers off the identity map and inadvertently log the
    // removals in reverse order.
    expect(logger.log.mock.calls).toEqual(expectedLogArgsByCallIndex);
  });
});
