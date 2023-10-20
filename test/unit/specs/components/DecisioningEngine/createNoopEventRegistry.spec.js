import createNoopEventRegistry from "../../../../../src/components/DecisioningEngine/createNoopEventRegistry";

describe("createNoopEventRegistry", () => {
  let instance;

  beforeEach(() => {
    instance = createNoopEventRegistry();
  });

  it("should return a valid instance", () => {
    expect(instance).toBeDefined();
  });

  it("addExperienceEdgeEvent should return an empty object", () => {
    const result = instance.addExperienceEdgeEvent();
    expect(result).toEqual({});
  });

  it("addEvent should return an empty object", () => {
    const result = instance.addEvent();
    expect(result).toEqual({});
  });

  it("getEvent should return an empty object", () => {
    const result = instance.getEvent();
    expect(result).toEqual({});
  });

  it("toJSON should return an empty object", () => {
    const result = instance.toJSON();
    expect(result).toEqual({});
  });
});
