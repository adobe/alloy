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
import createDecisionHistory from "../../../../../src/components/RulesEngine/createDecisionHistory.js";
import createEventRegistry from "../../../../../src/components/RulesEngine/createEventRegistry.js";

describe("RulesEngine:decisionHistory", () => {
  let storage;
  let history;
  let mockedTimestamp;
  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    history = createDecisionHistory({
      eventRegistry: createEventRegistry({
        storage,
      }),
    });

    mockedTimestamp = new Date("2023-05-24T08:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockedTimestamp);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records decision time", () => {
    const decision = history.recordQualified({
      id: "abc",
    });
    expect(Object.getPrototypeOf(decision)).toEqual(Object.prototype);
    expect(decision.timestamp).toEqual(expect.any(Number));
  });
  it("preserves first decision time, if decision already recorded", () => {
    const firstDecision = history.recordQualified({
      id: "abc",
    });

    vi.advanceTimersByTime(60);

    expect(
      history.recordQualified({
        id: "abc",
      }).firstTimestamp,
    ).toEqual(firstDecision.firstTimestamp);

    expect(
      history.recordQualified({
        id: "abc",
      }).firstTimestamp,
    ).toEqual(firstDecision.timestamp);
  });
  it("restores history from event storage", () => {
    expect(storage.getItem).toHaveBeenCalledWith("events");
  });
  it("saves history to event storage", () => {
    history.recordQualified({
      id: "abc",
    });

    vi.advanceTimersByTime(60);

    expect(storage.setItem).toHaveBeenCalledWith("events", expect.any(String));
  });
});
