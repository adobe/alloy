import { createContextComponent } from "../../../../src/components/Context/index";
import createPayload from "../../../../src/components/Core/createPayload";

describe("Create Context Component", () => {
  const context1 = () => {
    return { a: "1" };
  };
  const context2 = () => {
    return { b: "2" };
  };
  const component = createContextComponent(
    { context1, context2 },
    { context1 }
  );
  let configs;
  const core = {
    get configs() {
      return configs;
    }
  };

  it("enables the configured contexts", () => {
    configs = { context: ["context1", "context2"] };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({
      context1: { a: "1" },
      context2: { b: "2" }
    });
  });

  it("defaults to the default contexts", () => {
    configs = {};
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({
      context1: { a: "1" }
    });
  });

  it("ignores unknown contexts", () => {
    configs = { context: ["unknowncontext", "context1"] };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({
      context1: { a: "1" }
    });
  });

  it("can disable all contexts", () => {
    configs = { context: [] };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({});
  });

  it("disables all contexts when given a non-array config", () => {
    configs = { context: "context1" };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({});
  });

  it("adds to the context when onBeforeViewStart is called", () => {
    configs = { context: ["context1", "context2"] };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeViewStart(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({
      context1: { a: "1" },
      context2: { b: "2" }
    });
  });
});
