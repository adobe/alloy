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

import executeRules from "../../../../../../src/components/Personalization/turbine/executeRules";

describe("Personalization::turbine::executeRules", () => {
  it("should execute actions", () => {
    const action = "action";
    const event = "event";
    const actionSpy = jasmine.createSpy();
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    logger.enabled = true;
    const rules = [
      {
        actions: [
          {
            moduleType: action
          }
        ],
        events: [
          {
            moduleType: event
          }
        ]
      }
    ];
    const ruleComponentModules = {
      [action]: actionSpy,
      [event]: (_, trigger) => trigger()
    };

    executeRules(rules, ruleComponentModules, logger);

    expect(actionSpy).toHaveBeenCalled();
    expect(logger.log.calls.count()).toEqual(1);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should log error when execute actions fails", () => {
    const action = "action";
    const event = "event";
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    logger.enabled = true;
    const rules = [
      {
        actions: [
          {
            moduleType: action
          }
        ],
        events: [
          {
            moduleType: event
          }
        ]
      }
    ];
    const ruleComponentModules = {
      [action]: () => {
        throw new Error();
      },
      [event]: (_, trigger) => trigger()
    };

    executeRules(rules, ruleComponentModules, logger);

    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.error.calls.count()).toEqual(1);
  });

  it("should log nothing when there are no actions", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "log"]);
    const rules = [];
    const ruleComponentModules = {};

    executeRules(rules, ruleComponentModules, logger);

    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
