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

import injectProcessWarningsAndErrors from "../../../../../src/core/edgeNetwork/injectProcessWarningsAndErrors";

describe("processWarningsAndErrors", () => {
  let response;
  let logger;
  let processWarningsAndErrors;

  beforeEach(() => {
    response = {
      getWarnings() {
        return [];
      },
      getErrors() {
        return [];
      }
    };
    logger = jasmine.createSpyObj("logger", ["warn", "error"]);
    processWarningsAndErrors = injectProcessWarningsAndErrors({ logger });
  });

  it("logs warnings", () => {
    const warnings = [
      {
        title: "General warning",
        detail: "General warning detail"
      },
      {
        title: "Personalization warning",
        message: "Personalization warning detail"
      }
    ];
    response.getWarnings = () => warnings;

    processWarningsAndErrors(response);

    expect(logger.warn).toHaveBeenCalledWith(
      "The server responded with the following warning:",
      warnings[0]
    );
    expect(logger.warn).toHaveBeenCalledWith(
      "The server responded with the following warning:",
      warnings[1]
    );
  });

  it("logs errors", () => {
    const errors = [
      {
        title: "General warning",
        detail: "General warning detail"
      },
      {
        title: "Personalization warning",
        message: "Personalization warning detail"
      }
    ];
    response.getErrors = () => errors;

    processWarningsAndErrors(response);

    expect(logger.error).toHaveBeenCalledWith(
      "The server responded with the following non-fatal error:",
      errors[0]
    );
    expect(logger.error).toHaveBeenCalledWith(
      "The server responded with the following non-fatal error:",
      errors[1]
    );
  });
});
