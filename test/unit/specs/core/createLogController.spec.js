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

import createLogController from "../../../../src/core/createLogController";

const instanceNamespace = "foo";

describe("createLogController", () => {
  it("creates a namespaced storage", () => {
    const createNamespacedStorage = jasmine.createSpy().and.returnValue({
      persistent: {
        getItem() {}
      }
    });
    createLogController(instanceNamespace, createNamespacedStorage);
    expect(createNamespacedStorage).toHaveBeenCalledWith("instance.foo.");
  });

  it("returns false for logEnabled if storage item is not found", () => {
    const createNamespacedStorage = () => ({
      persistent: {
        getItem() {
          return null;
        }
      }
    });
    const logController = createLogController(
      instanceNamespace,
      createNamespacedStorage
    );
    expect(logController.logEnabled).toBe(false);
  });

  it("returns false for logEnabled if storage item is false", () => {
    const createNamespacedStorage = () => ({
      persistent: {
        getItem() {
          return "false";
        }
      }
    });
    const logController = createLogController(
      instanceNamespace,
      createNamespacedStorage
    );
    expect(logController.logEnabled).toBe(false);
  });

  it("returns true for logEnabled if storage item is true", () => {
    const createNamespacedStorage = () => ({
      persistent: {
        getItem() {
          return "true";
        }
      }
    });
    const logController = createLogController(
      instanceNamespace,
      createNamespacedStorage
    );
    expect(logController.logEnabled).toBe(true);
  });

  it("persists changes to logEnabled", () => {
    const storage = {
      persistent: {
        getItem() {
          return "false";
        },
        setItem: jasmine.createSpy()
      }
    };

    const createNamespacedStorage = () => storage;
    const logController = createLogController(
      instanceNamespace,
      createNamespacedStorage
    );
    logController.logEnabled = true;

    expect(storage.persistent.setItem).toHaveBeenCalledWith("log", "true");
  });
});
