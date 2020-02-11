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

import executeActions from "../../../../../../src/components/Personalization/turbine/executeActions";

describe("Personalization::turbine::executeActions", () => {
  it("should execute actions", () => {
    const actionSpy = jasmine.createSpy();
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    logger.enabled = true;
    const actions = [{ type: "foo" }];
    const modules = {
      foo: actionSpy
    };

    executeActions(actions, modules, logger);

    expect(actionSpy).toHaveBeenCalled();
    expect(logger.log.calls.count()).toEqual(1);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should not invoke logger.log when logger is not enabled", () => {
    const actionSpy = jasmine.createSpy();
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    logger.enabled = false;
    const actions = [{ type: "foo" }];
    const modules = {
      foo: actionSpy
    };

    executeActions(actions, modules, logger);

    expect(actionSpy).toHaveBeenCalled();
    expect(logger.log.calls.count()).toEqual(0);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should log error when execute actions fails", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    logger.enabled = true;
    const actions = [{ type: "foo" }];
    const modules = {
      foo: () => {
        throw new Error();
      }
    };

    executeActions(actions, modules, logger);

    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.error.calls.count()).toEqual(1);
  });

  it("should log nothing when there are no actions", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    const actions = [];
    const modules = {};

    executeActions(actions, modules, logger);

    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should log error when there are no actions types", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    logger.enabled = true;
    const actions = [{ type: "foo1" }];
    const modules = {
      foo: () => {}
    };

    executeActions(actions, modules, logger);

    expect(logger.error).toHaveBeenCalled();
  });

  it("should not invoke logger when logger is disabled", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    logger.enabled = false;
    const actions = [{ type: "foo1" }];
    const modules = {
      foo: () => {}
    };

    executeActions(actions, modules, logger);

    expect(logger.error).not.toHaveBeenCalled();
  });
});
