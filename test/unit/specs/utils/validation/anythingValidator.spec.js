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

import { anything } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::anything", () => {
  describeValidation("optional anything", anything(), [
    { value: {} },
    { value: { a: 1 } },
    { value: [] },
    { value: ["hello"] },
    { value: 1 },
    { value: true },
    { value: undefined },
    { value: null },
    { value: () => undefined }
  ]);

  describeValidation("required anything", anything().required(), [
    { value: {} },
    { value: { a: 1 } },
    { value: [] },
    { value: ["hello"] },
    { value: 1 },
    { value: true },
    { value: undefined, error: true },
    { value: null, error: true }
  ]);

  describeValidation("default anything", anything().default("foo"), [
    { value: {} },
    { value: { a: 1 } },
    { value: [] },
    { value: ["hello"] },
    { value: 1 },
    { value: true },
    { value: undefined, expected: "foo" },
    { value: null, expected: "foo" }
  ]);
});
