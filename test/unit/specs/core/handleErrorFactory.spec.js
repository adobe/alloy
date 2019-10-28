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

import handleErrorFactory from "../../../../src/core/handleErrorFactory";

const expectedMessageWithoutSuppressionNote =
  "[testinstanceNamespace] Bad thing happened.";
const expectedMessageWithSuppressionNote = `${expectedMessageWithoutSuppressionNote}\nNote: Errors can be suppressed by setting the errorsEnabled configuration option to false.`;

describe("handleErrorFactory", () => {
  it("converts non-error to error and throws", () => {
    const handleError = handleErrorFactory({
      instanceNamespace: "testinstanceNamespace",
      getErrorsEnabled() {
        return true;
      }
    });

    expect(() => {
      handleError("Bad thing happened.");
    }).toThrowError(expectedMessageWithSuppressionNote);
  });

  it("rethrows error with instanceNamespace prepended", () => {
    const handleError = handleErrorFactory({
      instanceNamespace: "testinstanceNamespace",
      getErrorsEnabled() {
        return true;
      }
    });

    expect(() => {
      handleError(new Error("Bad thing happened."));
    }).toThrowError(expectedMessageWithSuppressionNote);
  });

  it("logs error instead of throwing if errors are not enabled", () => {
    const logger = jasmine.createSpyObj("logger", ["error"]);
    const handleError = handleErrorFactory({
      instanceNamespace: "testinstanceNamespace",
      getErrorsEnabled() {
        return false;
      },
      logger
    });

    const error = new Error("Bad thing happened.");
    handleError(error);
    const loggedError = logger.error.calls.argsFor(0)[0];
    expect(loggedError.message).toBe(expectedMessageWithoutSuppressionNote);
  });
});
