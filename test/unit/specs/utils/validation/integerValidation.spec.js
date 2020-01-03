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

import { number } from "../../../../../src/utils/validation";
import describeValidation from "./describeValidation";

describe("validation::integer()", () => {
  describeValidation("optional integer", number().integer(), [
    { value: 42.01, error: true },
    { value: -1.1, error: true },
    { value: NaN, error: true },
    { value: 0 },
    { value: 42 },
    { value: -1 }
  ]);

  describeValidation(
    "required integer",
    number()
      .integer()
      .required(),
    [
      { value: null, error: true },
      { value: undefined, error: true },
      { value: 10 }
    ]
  );

  describeValidation(
    "default integer",
    number()
      .integer()
      .default(12345),
    [
      { value: null, expected: 12345 },
      { value: undefined, expected: 12345 },
      { value: 10, expected: 10 }
    ]
  );
});
