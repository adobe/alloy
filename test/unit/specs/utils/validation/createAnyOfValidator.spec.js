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
  literal
} from "../../../../../src/utils/validation";
import describeValidation from "../../../helpers/describeValidation";

describe("validation:anyOf", () => {
  describeValidation(
    "require one or the other",
    anyOf(
      [
        objectOf({
          viewStart: literal(true).required(),
          scopes: arrayOf(string())
        }).required(),
        objectOf({
          viewStart: boolean(),
          scopes: arrayOf(string())
            .nonEmpty()
            .required()
        }).required()
      ],
      "either viewStart set to true or scopes set to a nonEmpty array"
    ),
    [
      { value: undefined, error: true },
      { value: null, error: true },
      { value: {}, error: true },
      { value: { viewStart: true }, error: false },
      { value: { viewStart: false }, error: true },
      { value: { viewStart: "foo" }, error: true },
      { value: { scopes: [] }, error: true },
      { value: { scopes: ["a"] }, error: false },
      { value: { scopes: "bar" }, error: true },
      { value: { viewStart: true, scopes: ["a", "b"] }, error: false },
      { value: { viewStart: true, scopes: "foo" }, error: true },
      { value: { viewStart: "foo", scopes: ["a"] }, error: true }
    ]
  );
});
