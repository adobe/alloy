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
import createDecisionHistory from "../../../../../src/components/DecisioningEngine/createDecisionHistory.js";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry.js";

describe("DecisioningEngine:decisionHistory", () => {
  let storage;
  let history;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);

    history = createDecisionHistory({
      eventRegistry: createEventRegistry({ storage }),
    });
  });

  it("records decision time", () => {
    const decision = history.recordQualified({ id: "abc" });

    expect(Object.getPrototypeOf(decision)).toEqual(Object.prototype);
    expect(decision.timestamp).toEqual(jasmine.any(Number));
  });

  it("preserves first decision time, if decision already recorded", (done) => {
    const firstDecision = history.recordQualified({ id: "abc" });

    setTimeout(() => {
      expect(history.recordQualified({ id: "abc" }).firstTimestamp).toEqual(
        firstDecision.firstTimestamp,
      );
      expect(history.recordQualified({ id: "abc" }).firstTimestamp).toEqual(
        firstDecision.timestamp,
      );
      done();
    }, 20);
  });

  it("restores history from event storage", () => {
    expect(storage.getItem).toHaveBeenCalledWith("events");
  });

  it("saves history to event storage", (done) => {
    history.recordQualified({ id: "abc" });

    setTimeout(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        "events",
        jasmine.any(String),
      );
      done();
    }, 20);
  });
});
