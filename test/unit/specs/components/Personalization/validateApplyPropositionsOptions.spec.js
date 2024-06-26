/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import "jasmine-expect";
import { DOM_ACTION } from "@adobe/alloy/libEs5/constants/schema.js";
import validateApplyPropositionsOptions, {
  EMPTY_PROPOSITIONS,
} from "../../../../../src/components/Personalization/validateApplyPropositionsOptions.js";

const PROPOSITIONS = [
  {
    id: "abc",
    scope: "web://aepdemo.com/",
    scopeDetails: { decisionProvider: "AJO" },
    items: [
      {
        id: "abc",
        schema: DOM_ACTION,
        data: {
          type: "setHtml",
          content: "woof",
          selector: "#paragraph-text-1",
        },
      },
    ],
  },
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
    scope: "__view__",
    items: [
      {
        id: "442358",
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "click",
          format: "application/vnd.adobe.target.dom-action",
          selector:
            "#root > DIV:nth-of-type(1) > UL:nth-of-type(1) > LI:nth-of-type(4) > A:nth-of-type(1)",
        },
      },
    ],
    scopeDetails: {
      decisionProvider: "TGT",
      activity: {
        id: "442358",
      },
      characteristics: {
        eventToken: "+8J+6aZYrFL4hGqSwULhUQ==",
        analyticsToken: "442358:0:0|32767",
      },
    },
  },
];

const METADATA = {
  scope1: {
    selector: "#home-item1",
    actionType: "setHtml",
  },
};

describe("Personalization::validateApplyPropositionsOptions", () => {
  let loggerSpy;
  let logger;

  const resetLogger = () => {
    loggerSpy = jasmine.createSpy("logger.warn");
    logger = {
      warn: loggerSpy,
    };
  };

  beforeEach(() => {
    resetLogger();
  });

  it("it should log a warning when no options are present", () => {
    const result = validateApplyPropositionsOptions({
      logger,
    });

    expect(loggerSpy).toHaveBeenCalled();
    expect(result).toEqual(EMPTY_PROPOSITIONS);
  });

  it("it should log a warning when propositions array is missing from options", () => {
    const result = validateApplyPropositionsOptions({
      logger,
      options: {},
    });

    expect(loggerSpy).toHaveBeenCalled();
    expect(loggerSpy.calls.first().args[1].message).toEqual(
      "'propositions' is a required option",
    );

    expect(result).toEqual(EMPTY_PROPOSITIONS);
  });

  it("it should log a warning when propositions is empty array", () => {
    const result = validateApplyPropositionsOptions({
      logger,
      options: {
        propositions: [],
      },
    });

    expect(loggerSpy).toHaveBeenCalled();
    expect(loggerSpy.calls.first().args[1].message).toEqual(
      "'propositions': Expected a non-empty array, but got [].",
    );

    expect(result).toEqual(EMPTY_PROPOSITIONS);
  });

  it("it should log a warning when propositions are missing required values", () => {
    const scopeDetails = { decisionProvider: "AJO" };

    const tests = [
      {
        propositions: [{}],
        errorMessage:
          "'propositions[0].id' is a required option\n" +
          "'propositions[0].scope' is a required option\n" +
          "'propositions[0].scopeDetails' is a required option\n" +
          "'propositions[0].items' is a required option",
      },
      {
        propositions: [{ id: "abc" }],
        errorMessage:
          "'propositions[0].scope' is a required option\n" +
          "'propositions[0].scopeDetails' is a required option\n" +
          "'propositions[0].items' is a required option",
      },
      {
        propositions: [{ id: "abc", scope: "web://aepdemo.com/" }],
        errorMessage:
          "'propositions[0].scopeDetails' is a required option\n" +
          "'propositions[0].items' is a required option",
      },
      {
        propositions: [
          { id: "abc", scope: "web://aepdemo.com/", scopeDetails },
        ],
        errorMessage: "'propositions[0].items' is a required option",
      },
      {
        propositions: [
          {
            id: "abc",
            scope: "web://aepdemo.com/",
            scopeDetails,
            items: [],
          },
        ],
        errorMessage:
          "'propositions[0].items': Expected a non-empty array, but got [].",
      },
      {
        propositions: [
          {
            id: "abc",
            scope: "web://aepdemo.com/",
            scopeDetails,
            items: [{}],
          },
        ],
        errorMessage:
          "'propositions[0].items[0].id' is a required option\n" +
          "'propositions[0].items[0].schema' is a required option\n" +
          "'propositions[0].items[0].data' is a required option",
      },
      {
        propositions: [
          {
            id: "abc",
            scope: "web://aepdemo.com/",
            scopeDetails,
            items: [{ id: "abc" }],
          },
        ],
        errorMessage:
          "'propositions[0].items[0].schema' is a required option\n" +
          "'propositions[0].items[0].data' is a required option",
      },
      {
        propositions: [
          {
            id: "abc",
            scope: "web://aepdemo.com/",
            scopeDetails,
            items: [{ id: "abc", schema: DOM_ACTION }],
          },
        ],
        errorMessage: "'propositions[0].items[0].data' is a required option",
      },
    ];

    for (let i = 0; i < tests.length; i += 1) {
      const { propositions, errorMessage } = tests[i];
      resetLogger();

      const result = validateApplyPropositionsOptions({
        logger,
        options: {
          propositions,
        },
      });

      expect(loggerSpy).toHaveBeenCalled();

      expect(loggerSpy.calls.first().args[1].message).toEqual(errorMessage);

      expect(result).toEqual(EMPTY_PROPOSITIONS);
    }
  });

  it("it should not log a warning when extra options are present", () => {
    const result = validateApplyPropositionsOptions({
      logger,
      options: {
        bad: "bad",
        propositions: PROPOSITIONS,
      },
    });

    expect(loggerSpy).not.toHaveBeenCalled();
    expect(result).not.toEqual(EMPTY_PROPOSITIONS);
  });

  it("it should log a warning when metadata is not an object", () => {
    const result = validateApplyPropositionsOptions({
      logger,
      options: {
        propositions: PROPOSITIONS,
        metadata: [],
      },
    });

    expect(loggerSpy).toHaveBeenCalled();
    expect(loggerSpy.calls.first().args[1].message).toEqual(
      "'metadata': Expected an object, but got [].",
    );

    expect(result).toEqual(EMPTY_PROPOSITIONS);
  });

  it("it should not log a warning when propositions and metadata are present", () => {
    const result = validateApplyPropositionsOptions({
      logger,
      options: {
        propositions: PROPOSITIONS,
        metadata: METADATA,
      },
    });

    expect(loggerSpy).not.toHaveBeenCalled();
    expect(result).not.toEqual(EMPTY_PROPOSITIONS);
  });
});
