import createComponentRegistry from "../src/components/Core/createComponentRegistry";

const compOne = { namespace: "CompOne", commands: { do() {}, run() {} } };
const compTwo = {
  namespace: "CompTwo",
  commands: { do() {}, run() {}, eat() {} }
};

describe("createComponentRegistry", () => {
  describe("register", () => {
    it("should register components correctly", () => {
      const registry = createComponentRegistry();
      registry.register(compOne);
      const registeredCompOne = registry.getByNamespace("CompOne");
      expect(registeredCompOne).toBeDefined();
    });

    it("should not register components with existing commands", () => {
      expect(() => {
        const registry = createComponentRegistry();
        registry.register(compOne);
        registry.register(compTwo);
      }).toThrowError(
        "[ComponentRegistry] Could not register CompTwo because it has existing command(s): do,run"
      );
    });
  });

  describe("getCommand", () => {
    it("should find the command if it exists", () => {
      const registry = createComponentRegistry();
      registry.register(compTwo);
      const command = registry.getCommand("run");
      expect(command).toBeDefined();
      expect(typeof command).toBe("function");
    });

    it("should return undefined if command does not exist", () => {
      const registry = createComponentRegistry();
      registry.register(compTwo);
      const command = registry.getCommand("UNAVAILABLE");
      expect(command).not.toBeDefined();
    });
  });
});
