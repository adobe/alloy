import createDecisionHistory from "../../../../../src/components/DecisioningEngine/createDecisionHistory";

describe("DecisioningEngine:decisionHistory", () => {
  let storage;
  let history;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
    history = createDecisionHistory({ storage });
  });

  it("records decision time", () => {
    const decision = history.recordDecision("abc");

    expect(Object.getPrototypeOf(decision)).toEqual(Object.prototype);
    expect(decision.timestamp).toEqual(jasmine.any(Number));
  });

  it("uses prior decision time, if decision already recorded", done => {
    const firstDecision = history.recordDecision("abc");

    setTimeout(() => {
      expect(history.recordDecision("abc").timestamp).toEqual(
        firstDecision.timestamp
      );
      done();
    }, 200);
  });

  it("restores history from storage", () => {
    expect(storage.getItem).toHaveBeenCalledWith("history");
  });

  it("saves history to storage", done => {
    history.recordDecision("abc");

    setTimeout(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        "history",
        jasmine.any(String)
      );
      done();
    }, 200);
  });
});
