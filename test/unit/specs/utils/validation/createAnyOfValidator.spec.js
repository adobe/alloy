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

import {
  anyOf,
  objectOf,
  boolean,
  arrayOf,
  string,
  literal,
} from "../../../../../src/utils/validation";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation:anyOf", () => {
  describeValidation(
    "require one or the other",
    anyOf(
      [
        objectOf({
          renderDecisions: literal(true).required(),
          decisionScopes: arrayOf(string()),
        }).required(),
        objectOf({
          renderDecisions: boolean(),
          decisionScopes: arrayOf(string()).nonEmpty().required(),
        }).required(),
      ],
      "either renderDecisions set to true or decisionScopes set to a nonEmpty array",
    ),
    [
      { value: undefined, error: true },
      { value: null, error: true },
      { value: {}, error: true },
      { value: { renderDecisions: true }, error: false },
      { value: { renderDecisions: false }, error: true },
      { value: { renderDecisions: "foo" }, error: true },
      { value: { decisionScopes: [] }, error: true },
      { value: { decisionScopes: ["a"] }, error: false },
      { value: { decisionScopes: "bar" }, error: true },
      {
        value: { renderDecisions: true, decisionScopes: ["a", "b"] },
        error: false,
      },
      { value: { renderDecisions: true, decisionScopes: "foo" }, error: true },
      { value: { renderDecisions: "foo", decisionScopes: ["a"] }, error: true },
    ],
  );
});
