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

import { objectOf, string } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::noUnknownFields", () => {
  describeValidation("optional", objectOf({ a: string() }).noUnknownFields(), [
    { value: { b: "world" }, error: true },
    { value: { a: "hello", b: "world" }, error: true },
    { value: { a: "hello" }, error: false },
    { value: {}, error: false }
  ]);

  describeValidation(
    "required",
    objectOf({ a: string().required() })
      .noUnknownFields()
      .required(),
    [
      { value: null, error: true },
      { value: undefined, error: true },
      { value: {}, error: true },
      { value: { a: "Hello" }, error: false }
    ]
  );

  describeValidation(
    "default",
    objectOf({ a: string().default("hello") })
      .noUnknownFields()
      .default({ a: "world" }),
    [
      { value: null, expected: { a: "world" } },
      { value: undefined, expected: { a: "world" } },
      { value: {}, expected: { a: "hello" } },
      { value: { b: "goodbye" }, error: true }
    ]
  );
});
