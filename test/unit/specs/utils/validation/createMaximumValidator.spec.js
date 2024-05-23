/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { number } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::maximum", () => {
  describeValidation("optional maximum", number().integer().maximum(4), [
    { value: 3 },
    { value: 5, error: true },
    { value: null },
    { value: undefined },
  ]);

  describeValidation(
    "required maximum",
    number().integer().maximum(2).required(),
    [
      { value: null, error: true },
      { value: undefined, error: true },
      { value: 3, error: true },
      { value: 1 },
    ],
  );

  describeValidation(
    "default maximum",
    number().integer().maximum(10).default(8),
    [
      { value: null, expected: 8 },
      { value: undefined, expected: 8 },
      { value: 11, error: true },
    ],
  );
});
