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

import executeActions from "../../../../../../src/components/Personalization/dom-actions/executeActions";

describe("Personalization::executeActions", () => {
  it("should execute actions", () => {
    const actionSpy = jasmine.createSpy().and.returnValue(Promise.resolve(1));
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = true;
    const actions = [{ type: "foo" }];
    const modules = {
      foo: actionSpy
    };

    return executeActions(actions, modules, logger).then(result => {
      expect(result).toEqual([1]);
      expect(actionSpy).toHaveBeenCalled();
      expect(logger.info.calls.count()).toEqual(1);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it("should not invoke logger.info when logger is not enabled", () => {
    const actionSpy = jasmine.createSpy().and.returnValue(Promise.resolve(1));
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = false;
    const actions = [{ type: "foo" }];
    const modules = {
      foo: actionSpy
    };
    return executeActions(actions, modules, logger).then(result => {
      expect(result).toEqual([1]);
      expect(actionSpy).toHaveBeenCalled();
      expect(logger.info.calls.count()).toEqual(0);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it("should throw error when execute actions fails", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = true;
    const actions = [{ type: "foo" }];
    const modules = {
      foo: jasmine.createSpy().and.throwError("foo's error")
    };

    expect(() => executeActions(actions, modules, logger)).toThrowError();
  });

  it("should log nothing when there are no actions", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    const actions = [];
    const modules = {};

    return executeActions(actions, modules, logger).then(result => {
      expect(result).toEqual([]);
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it("should throw error when there are no actions types", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = true;
    const actions = [{ type: "foo1" }];
    const modules = {
      foo: () => {}
    };
    expect(() => executeActions(actions, modules, logger)).toThrowError();
  });
});
