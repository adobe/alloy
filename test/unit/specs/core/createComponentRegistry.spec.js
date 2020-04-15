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

import createComponentRegistry from "../../../../src/core/createComponentRegistry";

const commandErrorRegex = /\[CompOne\] An error occurred while executing the perform command./;
const lifecycleErrorRegex = /\[CompOne\] An error occurred while executing the onBeforeEvent lifecycle hook./;

describe("createComponentRegistry", () => {
  describe("register", () => {
    it("should not register components with existing commands", () => {
      expect(() => {
        const registry = createComponentRegistry();
        registry.register("CompOne", {
          commands: {
            command1() {},
            command2() {},
            command3() {}
          }
        });
        registry.register("CompTwo", {
          commands: {
            command2() {},
            command3() {},
            command4() {}
          }
        });
      }).toThrowError(
        "[ComponentRegistry] Could not register CompTwo because it has existing command(s): command2,command3"
      );
    });
  });

  describe("getCommand", () => {
    it("handles a command that returns a non-promise", () => {
      const registry = createComponentRegistry();
      const component = {
        commands: {
          perform: jasmine.createSpy().and.returnValue("nonPromiseValue")
        }
      };
      registry.register("CompOne", component);
      const command = registry.getCommand("perform");
      const result = command("arg1", "arg2");
      expect(component.commands.perform).toHaveBeenCalledWith("arg1", "arg2");
      expect(result).toBe("nonPromiseValue");
    });

    it("handles a command that returns a promise that gets resolved", () => {
      const registry = createComponentRegistry();
      const component = {
        commands: {
          perform: jasmine
            .createSpy()
            .and.returnValue(Promise.resolve("resolvedPromiseValue"))
        }
      };
      registry.register("CompOne", component);
      const command = registry.getCommand("perform");
      const result = command("arg1", "arg2");
      expect(component.commands.perform).toHaveBeenCalledWith("arg1", "arg2");
      return result.then(value => {
        expect(value).toBe("resolvedPromiseValue");
      });
    });

    it("handles a command that throws an error", () => {
      const registry = createComponentRegistry();
      const runSpy = jasmine.createSpy().and.throwError("thrownError");
      const component = {
        commands: {
          perform: {
            run: runSpy
          }
        }
      };
      registry.register("CompOne", component);
      const command = registry.getCommand("perform");
      expect(() => {
        command.run("arg1", "arg2");
      }).toThrowError(commandErrorRegex);
      expect(runSpy).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("handles a command that returns a promise that gets rejected", () => {
      const registry = createComponentRegistry();
      const runSpy = jasmine
        .createSpy()
        .and.returnValue(Promise.reject(new Error("rejectedPromiseError")));
      const component = {
        commands: {
          perform: {
            run: runSpy
          }
        }
      };
      registry.register("CompOne", component);
      const command = registry.getCommand("perform");
      const result = command.run("arg1", "arg2");
      expect(runSpy).toHaveBeenCalledWith("arg1", "arg2");
      return result.then(fail).catch(error => {
        expect(error).toEqual(jasmine.any(Error));
        expect(error.message).toMatch(commandErrorRegex);
      });
    });

    it("should return undefined if command does not exist", () => {
      const registry = createComponentRegistry();
      const command = registry.getCommand("bogus");
      expect(command).toBeUndefined();
    });
  });

  describe("getLifecycleCallbacks", () => {
    it("handles a callback that returns a non-promise", () => {
      const registry = createComponentRegistry();
      const component = {
        lifecycle: {
          onBeforeEvent: jasmine.createSpy().and.returnValue("nonPromiseValue")
        }
      };
      registry.register("CompOne", component);
      const callback = registry.getLifecycleCallbacks("onBeforeEvent")[0];
      const result = callback("arg1", "arg2");
      expect(component.lifecycle.onBeforeEvent).toHaveBeenCalledWith(
        "arg1",
        "arg2"
      );
      expect(result).toBe("nonPromiseValue");
    });

    it("handles a callback that returns a promise that gets resolved", () => {
      const registry = createComponentRegistry();
      const component = {
        lifecycle: {
          onBeforeEvent: jasmine
            .createSpy()
            .and.returnValue(Promise.resolve("resolvedPromiseValue"))
        }
      };
      registry.register("CompOne", component);
      const callback = registry.getLifecycleCallbacks("onBeforeEvent")[0];
      const result = callback("arg1", "arg2");
      expect(component.lifecycle.onBeforeEvent).toHaveBeenCalledWith(
        "arg1",
        "arg2"
      );
      return result.then(value => {
        expect(value).toBe("resolvedPromiseValue");
      });
    });

    it("handles a callback that throws an error", () => {
      const registry = createComponentRegistry();
      const component = {
        lifecycle: {
          onBeforeEvent: jasmine.createSpy().and.throwError("thrownError")
        }
      };
      registry.register("CompOne", component);
      const callback = registry.getLifecycleCallbacks("onBeforeEvent")[0];
      expect(() => {
        callback("arg1", "arg2");
      }).toThrowError(lifecycleErrorRegex);
      expect(component.lifecycle.onBeforeEvent).toHaveBeenCalledWith(
        "arg1",
        "arg2"
      );
    });

    it("handles a callback that returns a promise that gets rejected", () => {
      const registry = createComponentRegistry();
      const component = {
        lifecycle: {
          onBeforeEvent: jasmine
            .createSpy()
            .and.returnValue(Promise.reject(new Error("rejectedPromiseError")))
        }
      };
      registry.register("CompOne", component);
      const callback = registry.getLifecycleCallbacks("onBeforeEvent")[0];
      const result = callback("arg1", "arg2");
      expect(component.lifecycle.onBeforeEvent).toHaveBeenCalledWith(
        "arg1",
        "arg2"
      );
      return result.then(fail).catch(error => {
        expect(error).toEqual(jasmine.any(Error));
        expect(error.message).toMatch(lifecycleErrorRegex);
      });
    });

    it("should return all registered lifecycle callbacks", () => {
      const registry = createComponentRegistry();
      registry.register("CompOne", {
        lifecycle: {
          onBeforeEvent() {}
        }
      });
      registry.register("CompTwo", {
        lifecycle: {
          onBeforeEvent() {}
        }
      });
      const callbacks = registry.getLifecycleCallbacks("onBeforeEvent");
      expect(callbacks.length).toBe(2);
    });
  });
});
