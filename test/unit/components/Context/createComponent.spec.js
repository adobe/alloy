import createComponent from "../../../../src/components/Context/createComponent";
import createPayload from "../../../../src/core/createPayload";

describe("Context::createComponent", () => {
  const logger = {
    log() {},
    warn() {}
  };
  const context1 = () => {
    return { a: "1" };
  };
  const context2 = () => {
    return { b: "2" };
  };
  const availableContexts = { context1, context2 };
  const defaultContexts = { context1 };

  it("enables the configured contexts", () => {
    const config = { context: ["context1", "context2"] };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContexts
    );
    component.lifecycle.onComponentsRegistered();
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({ a: "1", b: "2" });
  });

  it("defaults to the default contexts", () => {
    const config = {};
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContexts
    );
    component.lifecycle.onComponentsRegistered();
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({ a: "1" });
  });

  it("ignores unknown contexts", () => {
    const config = { context: ["unknowncontext", "context1"] };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContexts
    );
    component.lifecycle.onComponentsRegistered();
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({ a: "1" });
  });

  it("can disable all contexts", () => {
    const config = { context: [] };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContexts
    );
    component.lifecycle.onComponentsRegistered();
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({});
  });

  it("disables all contexts when given a non-array config", () => {
    const config = { context: "context1" };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContexts
    );
    component.lifecycle.onComponentsRegistered();
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({});
  });

  it("adds to the context when onBeforeViewStart is called", () => {
    const config = { context: ["context1", "context2"] };
    const component = createComponent(
      config,
      logger,
      availableContexts,
      defaultContexts
    );
    component.lifecycle.onComponentsRegistered();
    const payload = createPayload();
    component.lifecycle.onBeforeViewStart(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({ a: "1", b: "2" });
  });
});
