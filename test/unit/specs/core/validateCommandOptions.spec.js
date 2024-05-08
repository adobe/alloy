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

import validateCommandOptions from "../../../../src/core/validateCommandOptions.js";

describe("validateCommandOptions", () => {
  let command;
  let options;

  beforeEach(() => {
    options = {};
    command = {
      commandName: "TEST",
      run: () => {}
    };
  });

  it("supports commands not implementing command options validation.", () => {
    expect(() => {
      validateCommandOptions({ command, options });
    }).not.toThrowError();
  });
  it("should throw exception if command options validator throws exception.", () => {
    command.optionsValidator = () => {
      throw new Error("Invalid Options");
    };
    expect(() => {
      validateCommandOptions({ command, options });
    }).toThrowError();
  });
  it("should include custom documentation URI in error message if provided by command options validator.", () => {
    command.optionsValidator = () => {
      throw new Error("Invalid Options");
    };
    command.documentationUri = "https://example.com";
    let errorMessage;
    try {
      validateCommandOptions({ command, options });
    } catch (e) {
      errorMessage = e.message;
    }
    expect(errorMessage).toMatch(/example.com/gm);
  });
});
