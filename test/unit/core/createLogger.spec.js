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

import createLogger from "../../../src/core/createLogger";

const logMethods = ["log", "info", "warn", "error"];
const prefix = "testprefix";
const spawnPrefix = "testspawnprefix";
const message = "test message";

describe("createLogger", () => {
  let window;
  let logController;
  let logger;

  beforeEach(() => {
    window = {
      console: jasmine.createSpyObj("console", logMethods)
    };
    logController = {};
    logger = createLogger(window, logController, prefix);
  });

  const testLogMethods = expectedPrefix => {
    logMethods.forEach(logMethod => {
      it(`logs message if debugging is enabled and ${logMethod} is called`, () => {
        logController.logEnabled = true;
        logger[logMethod](message);

        expect(window.console[logMethod]).toHaveBeenCalledWith(
          expectedPrefix,
          message
        );
      });

      it(`does not log a message if debugging is disabled and ${logMethod} is called`, () => {
        logController.logEnabled = false;
        logger[logMethod](message);

        expect(window.console[logMethod]).not.toHaveBeenCalled();
      });
    });
  };

  describe("with top-level logger", () => {
    testLogMethods(prefix);
  });

  describe("with spawned logger", () => {
    beforeEach(() => {
      logger = logger.spawn(spawnPrefix);
    });

    testLogMethods(`${prefix} ${spawnPrefix}`);
  });
});
