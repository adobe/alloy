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

import injectProcessWarningsAndErrors from "../../../../../src/core/edgeNetwork/injectProcessWarningsAndErrors.js";

describe("processWarningsAndErrors", () => {
  let logger;
  let processWarningsAndErrors;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["warn", "error"]);
    processWarningsAndErrors = injectProcessWarningsAndErrors({ logger });
  });

  it("throws error if status code is below 2xx", () => {
    expect(() => {
      processWarningsAndErrors({
        statusCode: 199,
      });
    }).toThrowError(
      "The server responded with a status code 199 and no response body.",
    );
  });

  it("throws error if status code is above 2xx", () => {
    expect(() => {
      processWarningsAndErrors({
        statusCode: 300,
      });
    }).toThrowError(
      "The server responded with a status code 300 and no response body.",
    );
  });

  it("throws error if no parsed body and HTTP status code is not 204", () => {
    expect(() => {
      processWarningsAndErrors({
        statusCode: 200,
      });
    }).toThrowError(
      "The server responded with a status code 200 and no response body.",
    );
  });

  it("throws an error if parsed body does not have handle array", () => {
    expect(() => {
      processWarningsAndErrors({
        statusCode: 200,
        body: '{"foo":"bar"}',
        parsedBody: { foo: "bar" },
      });
    }).toThrowError(
      'The server responded with a status code 200 and response body:\n{\n  "foo": "bar"\n}',
    );
  });

  it("logs warnings", () => {
    const warnings = [
      {
        title: "General warning",
        detail: "General warning detail",
      },
      {
        title: "Personalization warning",
        detail: "Personalization warning detail",
      },
    ];

    processWarningsAndErrors({
      statusCode: 200,
      parsedBody: {
        handle: [],
        warnings,
      },
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "The server responded with a warning:",
      warnings[0],
    );
    expect(logger.warn).toHaveBeenCalledWith(
      "The server responded with a warning:",
      warnings[1],
    );
  });

  it("logs non-fatal errors", () => {
    const errors = [
      {
        title: "General warning",
        detail: "General warning detail",
      },
      {
        title: "Personalization warning",
        detail: "Personalization warning detail",
      },
    ];

    processWarningsAndErrors({
      statusCode: 207,
      parsedBody: {
        handle: [],
        errors,
      },
    });

    expect(logger.error).toHaveBeenCalledWith(
      "The server responded with a non-fatal error:",
      errors[0],
    );
    expect(logger.error).toHaveBeenCalledWith(
      "The server responded with a non-fatal error:",
      errors[1],
    );
  });
});
