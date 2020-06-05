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

import injectHandleError from "../../../../src/core/injectHandleError";

const expectedMessage = "[testinstanceName] Bad thing happened.";

describe("injectHandleError", () => {
  it("converts non-error to error and throws", () => {
    const handleError = injectHandleError({
      instanceName: "testinstanceName"
    });

    expect(() => {
      handleError("Bad thing happened.");
    }).toThrowError(expectedMessage);
  });

  it("rethrows error with instanceName prepended", () => {
    const handleError = injectHandleError({
      instanceName: "testinstanceName"
    });

    expect(() => {
      handleError(new Error("Bad thing happened."));
    }).toThrowError(expectedMessage);
  });

  it("logs an error and returns empty object if error is due to declined consent", () => {
    const logger = jasmine.createSpyObj("logger", ["warn"]);
    const handleError = injectHandleError({
      instanceName: "testinstanceName",
      logger
    });

    const error = new Error("User declined consent.");
    error.code = "declinedConsent";
    expect(handleError(error, "test")).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "The test command could not fully complete because the user declined consent."
    );
  });
});
