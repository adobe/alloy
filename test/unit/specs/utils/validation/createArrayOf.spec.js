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

import { arrayOf, string } from "../../../../../src/utils/validation";
import describeTransformer from "./describeTransformer";

describe("validation::arrayOf", () => {
  describeTransformer(
    "optional array with required values",
    arrayOf(string().required()),
    [
      { value: ["foo", undefined], error: true },
      { value: [true, "bar"], error: true },
      { value: "non-array", error: true },
      { value: ["foo"] },
      { value: ["foo", "bar"] },
      { value: [] },
      { value: null },
      { value: undefined }
    ]
  );

  describeTransformer(
    "optional array with optional values",
    arrayOf(string().default("hello")),
    [
      {
        value: ["a", null, undefined, "b"],
        expected: ["a", "hello", "hello", "b"]
      }
    ]
  );

  describeTransformer(
    "required array with optional values",
    arrayOf(string()).required(),
    [
      { value: [null] },
      { value: null, error: true },
      { value: undefined, error: true }
    ]
  );
});
