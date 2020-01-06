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

import processWarningsAndErrors from "../../../../../src/core/edgeNetwork/processWarningsAndErrors";

describe("processWarningsAndErrors", () => {
  let response;
  let logger;

  beforeEach(() => {
    response = {
      getWarnings() {
        return [];
      },
      getErrors() {
        return [];
      }
    };
    logger = jasmine.createSpyObj("logger", ["warn"]);
  });

  it("logs warnings", () => {
    response.getWarnings = () => [
      {
        code: "general:100",
        message: "General warning."
      },
      {
        code: "personalization:204",
        message: "Personalization warning."
      }
    ];

    processWarningsAndErrors(response, logger);

    expect(logger.warn).toHaveBeenCalledWith(
      "Warning received from server: [Code general:100] General warning."
    );
    expect(logger.warn).toHaveBeenCalledWith(
      "Warning received from server: [Code personalization:204] Personalization warning."
    );
  });

  it("throws errors", () => {
    response.getErrors = () => [
      {
        code: "general:100",
        message: "General error occurred."
      },
      {
        code: "personalization:204",
        message: "Personalization error occurred."
      }
    ];

    expect(() => {
      processWarningsAndErrors(response, logger);
    }).toThrowError(
      "The server responded with the following errors:\n" +
        "• [Code general:100] General error occurred.\n" +
        "• [Code personalization:204] Personalization error occurred."
    );
  });
});
