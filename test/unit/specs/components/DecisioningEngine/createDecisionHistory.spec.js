import createDecisionHistory from "../../../../../src/components/DecisioningEngine/createDecisionHistory";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:decisionHistory", () => {
  let storage;
  let history;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);

    history = createDecisionHistory({
      eventRegistry: createEventRegistry({ storage, saveDelay: 10 })
    });
  });

  it("records decision time", () => {
    const decision = history.recordQualified({ id: "abc" });

    expect(Object.getPrototypeOf(decision)).toEqual(Object.prototype);
    expect(decision.timestamp).toEqual(jasmine.any(Number));
  });

  it("preserves first decision time, if decision already recorded", done => {
    const firstDecision = history.recordQualified({ id: "abc" });

    setTimeout(() => {
      expect(history.recordQualified({ id: "abc" }).firstTimestamp).toEqual(
        firstDecision.firstTimestamp
      );
      expect(history.recordQualified({ id: "abc" }).firstTimestamp).toEqual(
        firstDecision.timestamp
      );
      done();
    }, 20);
  });

  it("restores history from event storage", () => {
    expect(storage.getItem).toHaveBeenCalledWith("events");
  });

  it("saves history to event storage", done => {
    history.recordQualified({ id: "abc" });

    setTimeout(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        "events",
        jasmine.any(String)
      );
      done();
    }, 20);
  });
});
