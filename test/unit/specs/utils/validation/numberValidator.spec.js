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

import { number } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::number", () => {
  describeValidation("optional number", number(), [
    { value: true, error: true },
    { value: "", error: true },
    { value: "42", error: true },
    { value: [1], error: true },
    { value: {}, error: true },
    { value: NaN, error: true },
    { value: 0 },
    { value: 0.01 },
    { value: Infinity }
  ]);

  describeValidation("required number", number().required(), [
    { value: null, error: true },
    { value: undefined, error: true },
    { value: 123 }
  ]);

  describeValidation("default number", number().default(-1), [
    { value: null, expected: -1 },
    { value: undefined, expected: -1 },
    { value: 123 }
  ]);
});
