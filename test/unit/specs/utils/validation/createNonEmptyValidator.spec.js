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

import { string } from "../../../../../src/utils/validation";
import describeValidation from "../../../helpers/describeValidation";

describe("validation::nonEmpty", () => {
  describeValidation("optional nonEmpty", string().nonEmpty(), [
    { value: "key" },
    { value: "", error: true },
    { value: null },
    { value: undefined }
  ]);
  describeValidation(
    "required nonEmpty",
    string()
      .nonEmpty()
      .required(),
    [
      { value: "abc" },
      { value: null, error: true },
      { value: undefined, error: true }
    ]
  );
  describeValidation(
    "default nonEmpty",
    string()
      .nonEmpty()
      .default("mydefault"),
    [
      { value: null, expected: "mydefault" },
      { value: undefined, expected: "mydefault" },
      { value: "abc" }
    ]
  );
});
