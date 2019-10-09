import createComponent from "../../../../../src/components/Context/createComponent";

describe("Context::createComponent", () => {
  const logger = {
    log() {},
    warn() {}
  };
  const context1 = () => ({ a: "1" });
  const context2 = () => ({ b: "2" });
  const requiredContext = () => ({ c: "3" });
  const availableContexts = { context1, context2 };
  let event;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeXdm"]);
  });

  it("enables the configured contexts", () => {
    const config = { context: ["context1", "context2"] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({ a: "1", b: "2", c: "3" });
  });
  it("ignores unknown contexts", () => {
    const config = { context: ["unknowncontext", "context1"] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({ a: "1", c: "3" });
  });

  it("can disable non-required contexts", () => {
    const config = { context: [] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({ c: "3" });
  });

  it("disables non-required contexts when given a non-array config", () => {
    const config = { context: "context1" };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({ c: "3" });
  });
});
