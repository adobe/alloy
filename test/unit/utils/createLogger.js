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

const logMethods = ["log", "info", "warn", "error"];
const namespace = "testnamespace";
const message = "test message";

describe("createLogger", () => {
  let createLogger;
  let mockWindow;

  beforeEach(() => {
    mockWindow = {
      console: jasmine.createSpyObj("console", logMethods)
    };
  });

  logMethods.forEach(logMethod => {
    it(`logs message if debugging is enabled and ${logMethod} is called`, () => {
      const logger = createLogger(
        mockWindow,
        {
          debugEnabled: true
        },
        namespace
      );

      logger[logMethod]("test message");

      expect(mockWindow.console[logMethod]).toHaveBeenCalledWith(
        "[AEP]",
        `[${namespace}]`,
        message
      );
    });

    it(`does not log a message if debugging is disabled and ${logMethod} is called`, () => {
      const logger = createLogger(
        mockWindow,
        {
          debugEnabled: false
        },
        namespace
      );

      logger[logMethod]("test message");

      expect(mockWindow.console[logMethod]).not.toHaveBeenCalled();
    });
  });
});
