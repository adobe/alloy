/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
