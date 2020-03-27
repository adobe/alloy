/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import validateCommandOptions from "../../../../src/core/validateCommandOptions";

describe("validateCommandOptions", () => {
  let command;
  let options;
  let logger;

  beforeEach(() => {
    logger = { warn: jasmine.createSpy() };
    options = {};
    command = {
      commandName: "TEST",
      run: () => {}
    };
  });

  it("should throw exception if command options validator throw exception.", () => {
    command.optionsValidator = () => {
      throw new Error("Invalid Options");
    };
    expect(() => {
      validateCommandOptions({ command, options, logger });
    }).toThrowError();
  });
  it("should throw exception if error provided by command options validator.", () => {
    command.optionsValidator = () => {
      const errors = ["Invalid Options"];
      return { errors };
    };
    expect(() => {
      validateCommandOptions({ command, options, logger });
    }).toThrowError();
  });
  it("should include custom documentation URI in warning if provided by command options validator.", () => {
    command.optionsValidator = () => {
      const warnings = ["Somewhat Invalid Options"];
      return { warnings };
    };
    command.documentationUri = "https://example.com";
    validateCommandOptions({ command, options, logger });
    expect(logger.warn).toHaveBeenCalledWith(
      jasmine.stringMatching(/example.com/gm)
    );
  });
});
