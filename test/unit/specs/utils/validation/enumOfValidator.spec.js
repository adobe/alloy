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

import { enumOf } from "../../../../../src/utils/validation";
import describeValidation from "../../../helpers/describeValidation";

describe("validation:enumOf", () => {
  describeValidation("optional enum", enumOf("in", 1234, 0.1, false), [
    { value: undefined, error: false },
    { value: 1234, error: false },
    { value: "in", error: false },
    { value: null, error: false },
    { value: 0.1, error: false },
    { value: false, error: false },
    { value: "out", error: true },
    { value: "", error: true },
    { value: {}, error: true },
    { value: [], error: true }
  ]);
  describeValidation("required enum", enumOf("in", "pending").required(), [
    { value: "in", error: false },
    { value: "pending", error: false },
    { value: null, error: true },
    { value: undefined, error: true },
    { value: 0.1, error: true },
    { value: false, error: true },
    { value: "out", error: true },
    { value: "", error: true },
    { value: {}, error: true },
    { value: [], error: true }
  ]);
});
