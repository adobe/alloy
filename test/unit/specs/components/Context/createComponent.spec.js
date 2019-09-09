import createComponent from "../../../../../src/components/Context/createComponent";

describe("Context::createComponent", () => {
  const logger = {
    log() {},
    warn() {}
  };
  const context1 = payload => {
    payload.addContext1({
      a: "1"
    });
  };
  const context2 = payload => {
    payload.addContext2({
      b: "2"
    });
  };
  const requiredContext = payload => {
    payload.addRequiredContext({
      c: "3"
    });
  };
  const availableContexts = { context1, context2 };
  let event;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", [
      "addContext1",
      "addContext2",
      "addRequiredContext"
    ]);
  });

  it("enables the configured contexts", () => {
    const config = { context: ["context1", "context2"] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent({ event });

    expect(event.addContext1).toHaveBeenCalledWith({ a: "1" });
    expect(event.addContext2).toHaveBeenCalledWith({ b: "2" });
    expect(event.addRequiredContext).toHaveBeenCalledWith({ c: "3" });
  });
  it("ignores unknown contexts", () => {
    const config = { context: ["unknowncontext", "context1"] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent({ event });

    expect(event.addContext1).toHaveBeenCalledWith({ a: "1" });
    expect(event.addContext2).not.toHaveBeenCalled();
    expect(event.addRequiredContext).toHaveBeenCalledWith({ c: "3" });
  });

  it("can disable non-required contexts", () => {
    const config = { context: [] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent({ event });

    expect(event.addContext1).not.toHaveBeenCalled();
    expect(event.addContext2).not.toHaveBeenCalled();
    expect(event.addRequiredContext).toHaveBeenCalledWith({ c: "3" });
  });

  it("disables non-required contexts when given a non-array config", () => {
    const config = { context: "context1" };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent({ event });

    expect(event.addContext1).not.toHaveBeenCalled();
    expect(event.addContext2).not.toHaveBeenCalled();
    expect(event.addRequiredContext).toHaveBeenCalledWith({ c: "3" });
  });
});
