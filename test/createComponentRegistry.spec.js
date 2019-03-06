import createComponentRegistry from "../src/components/Core/createComponentRegistry";

const compOne = { namespace: "CompOne", commands: { do() {}, run() {} } };
const compTwo = {
  namespace: "CompTwo",
  commands: { do() {}, run() {}, eat() {} }
};

describe("createComponentRegistry", () => {
  const registry = createComponentRegistry();

  describe("register", () => {
    it("should register components correctly", () => {
      registry.register(compOne);
      const registeredCompOne = registry.getByNamespace("CompOne");
      expect(registeredCompOne).toBeDefined();
    });

    it("should not register components with existing commands", () => {
      expect(() => {
        registry.register(compTwo);
      }).toThrowError(
        "[ComponentRegistry] Could not register CompTwo because it has existing command(s): do,run"
      );
    });
  });
});
