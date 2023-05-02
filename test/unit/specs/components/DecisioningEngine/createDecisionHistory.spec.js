import createDecisionHistory from "../../../../../src/components/DecisioningEngine/createDecisionHistory";

describe("DecisioningEngine:decisionHistory", () => {
  let storage;
  let history;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
    history = createDecisionHistory({ storage });
  });

  it("records decision time", () => {
    const decisionTime = history.recordDecision("abc");

    expect(decisionTime).toEqual(jasmine.any(Number));
  });

  it("uses prior decision time, if decision already recorded", done => {
    const firstDecisionTime = history.recordDecision("abc");

    setTimeout(() => {
      expect(history.recordDecision("abc")).toEqual(firstDecisionTime);
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
