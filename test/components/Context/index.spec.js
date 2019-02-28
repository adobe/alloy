import { createContextComponent } from "../../../src/components/Context/index";
import createPayload from "../../../src/components/Core/createPayload";

describe("Create Context Component", () => {
  const context1 = () => {
    return { a: "1" };
  };
  const context2 = () => {
    return { b: "2" };
  };
  const component = createContextComponent({ context1, context2 });
  let configs;
  const core = {
    get configs() {
      return configs;
    }
  };

  it("works with a configured context", () => {
    configs = { context: ["context1", "context2"] };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({
      context1: { a: "1" },
      context2: { b: "2" }
    });
  });

  it("defaults to all the contexts", () => {
    configs = {};
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({
      context1: { a: "1" },
      context2: { b: "2" }
    });
  });

  it("handles unknown contexts", () => {
    configs = { context: ["unknowncontext", "context1"] };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({
      context1: { a: "1" }
    });
  });

  it("handles empty context", () => {
    configs = { context: [] };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({});
  });

  it("handles non-array context", () => {
    configs = { context: "context1" };
    component.lifecycle.onComponentsRegistered(core);
    const payload = createPayload();
    component.lifecycle.onBeforeEvent(payload);

    expect(JSON.parse(payload.toJson()).context).toEqual({});
  });

  it("works when onBeforeViewStart is called", () => {
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
