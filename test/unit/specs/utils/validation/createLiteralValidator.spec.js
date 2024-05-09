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

import { literal } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation:literal", () => {
  describeValidation("literal optional string", literal("hello"), [
    { value: undefined, error: false },
    { value: null, error: false },
    { value: "hello", error: false },
    { value: {}, error: true },
    { value: "", error: true },
    { value: "goodbye", error: true },
  ]);
  describeValidation("literal required integer", literal(42).required(), [
    { value: 42, error: false },
    { value: 41, error: true },
    { value: null, error: true },
    { value: undefined, error: true },
  ]);
});
