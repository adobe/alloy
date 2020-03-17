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
import describeValidation from "../../../helpers/describeValidation";

describe("validation::minimum", () => {
  describeValidation(
    "optional minimum",
    number()
      .integer()
      .minimum(4),
    [
      { value: 3, error: true },
      { value: 4 },
      { value: 5 },
      { value: null },
      { value: undefined }
    ]
  );

  describeValidation(
    "required minimum",
    number()
      .integer()
      .minimum(1)
      .required(),
    [
      { value: null, error: true },
      { value: undefined, error: true },
      { value: 0, error: true },
      { value: 1 }
    ]
  );

  describeValidation(
    "default minimum",
    number()
      .integer()
      .minimum(10)
      .default(42),
    [
      { value: null, expected: 42 },
      { value: undefined, expected: 42 },
      { value: 0, error: true }
    ]
  );
});
