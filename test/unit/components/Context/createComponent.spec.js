import createComponent from "../../../../src/components/Context/createComponent";

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
  const availableContexts = { context1, context2 };
  const defaultContextNames = ["context1"];
  let event;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["addContext1", "addContext2"]);
  });

  it("enables the configured contexts", () => {
    const config = { context: ["context1", "context2"] };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContextNames
    );
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent(event);

    expect(event.addContext1).toHaveBeenCalledWith({ a: "1" });
    expect(event.addContext2).toHaveBeenCalledWith({ b: "2" });
  });

  it("defaults to the default contexts", () => {
    const config = {};
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContextNames
    );
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent(event);

    expect(event.addContext1).toHaveBeenCalledWith({ a: "1" });
    expect(event.addContext2).not.toHaveBeenCalled();
  });

  it("ignores unknown contexts", () => {
    const config = { context: ["unknowncontext", "context1"] };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContextNames
    );
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent(event);

    expect(event.addContext1).toHaveBeenCalledWith({ a: "1" });
    expect(event.addContext2).not.toHaveBeenCalled();
  });

  it("can disable all contexts", () => {
    const config = { context: [] };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContextNames
    );
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent(event);

    expect(event.addContext1).not.toHaveBeenCalled();
    expect(event.addContext2).not.toHaveBeenCalled();
  });

  it("disables all contexts when given a non-array config", () => {
    const config = { context: "context1" };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContextNames
    );
    component.lifecycle.onComponentsRegistered();
    component.lifecycle.onBeforeEvent(event);

    expect(event.addContext1).not.toHaveBeenCalled();
    expect(event.addContext2).not.toHaveBeenCalled();
  });
});
